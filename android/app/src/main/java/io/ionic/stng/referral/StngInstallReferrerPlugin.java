package io.ionic.stng.referral;

import android.content.SharedPreferences;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.concurrent.atomic.AtomicBoolean;

/** Captures store reference only. Never calls login, SMS or attribution endpoints. */
@CapacitorPlugin(name = "StngInstallReferrer")
public class StngInstallReferrerPlugin extends Plugin {
    private static final long TTL = 30L * 24 * 60 * 60 * 1000;
    private static final long TIMEOUT = 8000;
    private final Handler main = new Handler(Looper.getMainLooper());
    private boolean inFlight;
    private long retryAfter;
    private StoreReferrer active;

    private SharedPreferences prefs() { return getContext().getSharedPreferences("stng_install_referral", 0); }
    private JSObject answer(String status) { return new JSObject().put("status", status).put("source", StoreReferrerFactory.SOURCE); }
    private JSObject pendingAnswer(String token) { return answer("pending").put("token", token).put("source", prefs().getString("source", StoreReferrerFactory.SOURCE)); }
    private String installer() {
        try {
            if (Build.VERSION.SDK_INT >= 30) return getContext().getPackageManager().getInstallSourceInfo(getContext().getPackageName()).getInstallingPackageName();
            return getContext().getPackageManager().getInstallerPackageName(getContext().getPackageName());
        } catch (Exception ignored) { return null; }
    }
    private String pending() {
        SharedPreferences p = prefs();
        String token = p.getString("token", null);
        long captured = p.getLong("captured", 0);
        long now = System.currentTimeMillis();
        if (ReferrerToken.valid(token) && captured > 0 && now >= captured && now - captured < TTL) return token;
        if (token != null) p.edit().remove("token").remove("captured").remove("source").putBoolean("done", true).commit();
        return null;
    }
    @PluginMethod public void getPending(PluginCall call) {
        main.post(() -> {
            String token = pending();
            if (token != null) { call.resolve(pendingAnswer(token)); return; }
            if (prefs().getBoolean("done", false)) { call.resolve(answer("none")); return; }
            if (!StoreReferrerFactory.INSTALLER.equals(installer())) { call.resolve(answer("unavailable")); return; }
            if (inFlight || System.currentTimeMillis() < retryAfter) { call.resolve(answer("busy")); return; }
            inFlight = true;
            AtomicBoolean replied = new AtomicBoolean(false);
            AtomicBoolean completed = new AtomicBoolean(false);
            Runnable timeout = () -> {
                if (replied.compareAndSet(false, true)) call.resolve(answer("unavailable"));
                // Keep RuStore request unique until it finishes: a late destructive read must not be lost.
            };
            main.postDelayed(timeout, TIMEOUT);
            try {
                StoreReferrer request = StoreReferrerFactory.create(getContext());
                active = request;
                request.read((received, terminal) -> main.post(() -> {
                    if (!completed.compareAndSet(false, true)) return;
                    // Persist before resolving JS, including responses arriving after timeout.
                    String old = pending();
                    boolean stored = true;
                    if (old == null && !prefs().getBoolean("done", false)) {
                        if (ReferrerToken.valid(received)) stored = prefs().edit().putString("token", received)
                            .putString("source", StoreReferrerFactory.SOURCE).putLong("captured", System.currentTimeMillis()).commit();
                        else if (terminal) stored = prefs().edit().putBoolean("done", true).commit();
                    }
                    inFlight = false;
                    retryAfter = terminal ? 0 : System.currentTimeMillis() + 30000;
                    main.removeCallbacks(timeout);
                    try { request.close(); } catch (Exception ignored) {}
                    if (active == request) active = null;
                    if (replied.compareAndSet(false, true)) {
                        String saved = pending();
                        call.resolve(!stored ? answer("error") : saved != null ? pendingAnswer(saved) : answer(terminal ? "none" : "unavailable"));
                    }
                }));
            } catch (Exception ignored) {
                main.removeCallbacks(timeout);
                inFlight = false;
                retryAfter = System.currentTimeMillis() + 30000;
                if (active != null) { try { active.close(); } catch (Exception ignoredClose) {} active = null; }
                if (replied.compareAndSet(false, true)) call.resolve(answer("unavailable"));
            }
        });
    }
    @PluginMethod public void acknowledge(PluginCall call) {
        main.post(() -> {
            String token = call.getString("token");
            String current = pending();
            if (!ReferrerToken.valid(token) || current == null || !current.equals(token)) { call.resolve(answer("mismatch")); return; }
            boolean saved = prefs().edit().remove("token").remove("captured").remove("source").putBoolean("done", true).commit();
            call.resolve(answer(saved ? "acknowledged" : "error"));
        });
    }
    @Override protected void handleOnDestroy() {
        if (active != null) { try { active.close(); } catch (Exception ignored) {} }
        super.handleOnDestroy();
    }
}
