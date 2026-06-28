package com.flashmd.model;

import java.util.List;

public record Progress(List<String> known, List<String> unknown, String lastStudied) {
    public static Progress empty() {
        return new Progress(List.of(), List.of(), null);
    }
}
