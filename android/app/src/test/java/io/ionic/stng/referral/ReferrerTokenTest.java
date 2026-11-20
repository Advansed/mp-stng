package io.ionic.stng.referral;

import org.junit.Test;
import static org.junit.Assert.*;

public class ReferrerTokenTest {
    private static final String TOKEN = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQ";
    @Test public void validPlayPayload() { assertEquals(TOKEN, ReferrerToken.play("stng_invite=" + TOKEN)); }
    @Test public void validRuStorePayload() { assertEquals(TOKEN, ReferrerToken.rustore(TOKEN)); }
    @Test public void rejectsExtraFieldsAndUrls() {
        for (String value : new String[] { null, "", TOKEN, "stng_invite=" + TOKEN + "&x=1", "stng_invite=" + TOKEN + "\n", "https://referal.aostng.ru/r/" + TOKEN, "stng_invite=" + TOKEN + "%20" }) assertNull(ReferrerToken.play(value));
    }
    @Test public void strictRawToken() {
        for (String value : new String[] { null, "", TOKEN + "a", TOKEN.substring(1), TOKEN + "\n", " " + TOKEN, "stng_invite=" + TOKEN }) assertFalse(ReferrerToken.valid(value));
    }
    @Test public void acceptsBase64UrlCharacters() { assertTrue(ReferrerToken.valid("_-" + TOKEN.substring(2))); }
}
