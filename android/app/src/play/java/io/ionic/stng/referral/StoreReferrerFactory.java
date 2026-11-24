package io.ionic.stng.referral;

import android.content.Context;
import com.android.installreferrer.api.InstallReferrerClient;
import com.android.installreferrer.api.InstallReferrerStateListener;

public final class StoreReferrerFactory {
    public static final String INSTALLER = "com.android.vending";
    public static final String SOURCE = "google-play";
    public static StoreReferrer create(Context context) {
        return new StoreReferrer() {
            private final InstallReferrerClient client = InstallReferrerClient.newBuilder(context).build();
            public void read(Result result) {
                client.startConnection(new InstallReferrerStateListener() {
                    public void onInstallReferrerSetupFinished(int responseCode) {
                        if (responseCode != InstallReferrerClient.InstallReferrerResponse.OK) {
                            result.complete(null, responseCode == InstallReferrerClient.InstallReferrerResponse.FEATURE_NOT_SUPPORTED);
                            return;
                        }
                        try { result.complete(ReferrerToken.play(client.getInstallReferrer().getInstallReferrer()), true); }
                        catch (Exception ignored) { result.complete(null, false); }
                    }
                    public void onInstallReferrerServiceDisconnected() { result.complete(null, false); }
                });
            }
            public void close() { client.endConnection(); }
        };
    }
}
