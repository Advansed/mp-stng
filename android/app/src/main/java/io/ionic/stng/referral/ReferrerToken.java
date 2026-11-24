package io.ionic.stng.referral;

/** Does not establish subscriber identity or authorize any credit. */
public final class ReferrerToken {
    private ReferrerToken() {}
    public static boolean valid(String token) {
        return token != null && token.length() == 43 && token.matches("[A-Za-z0-9_-]{43}");
    }
    public static String play(String value) {
        if (value == null || !value.startsWith("stng_invite=")) return null;
        String token = value.substring("stng_invite=".length());
        return valid(token) ? token : null;
    }
    public static String rustore(String value) { return valid(value) ? value : null; }
}
