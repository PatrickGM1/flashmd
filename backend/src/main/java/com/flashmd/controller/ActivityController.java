package com.flashmd.controller;

import com.flashmd.service.ActivityStore;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/activity")
@CrossOrigin(origins = "*")
@Tag(name = "Activity", description = "Study streak and daily counts")
public class ActivityController {

    private final ActivityStore activity;

    public ActivityController(ActivityStore activity) {
        this.activity = activity;
    }

    public record ActivityResponse(int streak, int today) {}

    @GetMapping
    @Operation(summary = "Current study streak and today's reviewed count")
    public ActivityResponse get() {
        return new ActivityResponse(activity.streak(), activity.todayCount());
    }
}
