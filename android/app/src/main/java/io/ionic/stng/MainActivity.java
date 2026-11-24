package io.ionic.stng;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import io.ionic.stng.referral.StngInstallReferrerPlugin;

public class MainActivity extends BridgeActivity {
    @Override public void onCreate(Bundle savedInstanceState) {
        registerPlugin(StngInstallReferrerPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
