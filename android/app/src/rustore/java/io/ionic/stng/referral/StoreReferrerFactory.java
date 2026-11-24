package io.ionic.stng.referral;

import android.content.Context;
import ru.rustore.sdk.install.referrer.InstallReferrerClient;

public final class StoreReferrerFactory {
    public static final String INSTALLER = "ru.vk.store";
    public static final String SOURCE = "rustore";
    public static StoreReferrer create(Context context) {
        return new StoreReferrer() {
            private final InstallReferrerClient client = new InstallReferrerClient(context);
            public void read(Result result) {
                client.getInstallReferrerV2()
                    .addOnSuccessListener(value -> {
                        result.complete(value == null || !value.isFromRuStore() ? null : ReferrerToken.rustore(value.getInstallReferrer()), true);
                    })
                    .addOnFailureListener(ignored -> result.complete(null, false));
            }
            // Do not cancel a consume-on-read request before its result is durably captured.
            public void close() {}
        };
    }
}
