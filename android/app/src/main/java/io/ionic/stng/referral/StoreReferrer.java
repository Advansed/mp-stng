package io.ionic.stng.referral;

public interface StoreReferrer {
    interface Result { void complete(String token, boolean terminal); }
    void read(Result result);
    void close();
}
