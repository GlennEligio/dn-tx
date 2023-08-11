package com.glenneligio.dntx.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;
import java.util.Base64;
import java.util.Map;


public class Utils {

    private Utils() {}

    public static String toHex(byte[] array) {
        BigInteger bi = new BigInteger(1, array);
        String hex = bi.toString(16);
        int paddingLength = (array.length * 2) - hex.length();
        if (paddingLength > 0) {
            return String.format("%0" + paddingLength + "d", 0) + hex;
        } else {
            return hex;
        }
    }

    public static String bytesToString(byte[] bArr) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bArr) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    public static byte[] pbkdf2(char[] text, byte[] salt, int iterationCount, int keyLength)
            throws NoSuchAlgorithmException, InvalidKeySpecException {

        KeySpec spec = new PBEKeySpec(text, salt, iterationCount, keyLength);
        SecretKeyFactory f = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA512");
        return f.generateSecret(spec).getEncoded();
    }

    public static String convertToBase64(String str) {
        return new String(Base64.getEncoder().encode(stringToBytes(str)), StandardCharsets.UTF_8);
    }

    private static byte[] stringToBytes(String str) {
        return str.getBytes(StandardCharsets.UTF_8);
    }

    public static String hashSHA256(String base) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(stringToBytes(base));
        return bytesToString(hash);
    }

    public static ObjectNode createObjectNodeFromMap(Map<String, Object> attributeMap) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode objectNode = mapper.createObjectNode();
        for(Map.Entry<String, Object> entry : attributeMap.entrySet()) {
            objectNode.put(entry.getKey(), mapper.writeValueAsString(entry.getValue()));
        }
        return objectNode;
    }
}
