package com.flashmd.controller;

import com.flashmd.auth.CurrentUser;
import com.flashmd.service.ActivityStore;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/activity")
@Tag(name = "Activity", description = "Study streak and daily counts")
public class ActivityController {

    private final ActivityStore activity;

    public ActivityController(ActivityStore activity) {
        this.activity = activity;
    }

    public record ActivityResponse(int streak, int today) {}

    @GetMapping
    @Operation(summary = "Current study streak and today's reviewed count")
    public ActivityResponse get(@RequestParam(required = false) String owner) {
        String who = (owner != null && CurrentUser.isAdmin()) ? owner : CurrentUser.id();
        return new ActivityResponse(activity.streak(who), activity.todayCount(who));
    }
}
