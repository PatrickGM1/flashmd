package com.flashmd.controller.dto;

import java.util.List;

public record ProgressRequest(List<String> known, List<String> unknown) {}
