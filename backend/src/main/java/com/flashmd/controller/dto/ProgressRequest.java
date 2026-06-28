package com.flashmd.controller.dto;

import com.flashmd.model.Grade;

import java.util.List;

/** A study session's results: a grade per card reviewed. */
public record ProgressRequest(List<GradeEntry> grades) {
    public record GradeEntry(String question, Grade grade) {}
}
