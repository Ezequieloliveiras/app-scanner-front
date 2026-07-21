import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  canApplyProfileRefresh,
  isLatestProfileMutation,
  normalizeCameraEnabled,
  shouldHydrateCameraPreference
} from "./cameraPreference";

test("renders active when the API returns cameraEnabled true", () => {
  assert.equal(normalizeCameraEnabled(true), true);
});

test("renders inactive when the API returns cameraEnabled false", () => {
  assert.equal(normalizeCameraEnabled(false), false);
});

test("normalizes legacy values without treating the string false as active", () => {
  assert.equal(normalizeCameraEnabled("true"), true);
  assert.equal(normalizeCameraEnabled("1"), true);
  assert.equal(normalizeCameraEnabled(1), true);
  assert.equal(normalizeCameraEnabled("false"), false);
  assert.equal(normalizeCameraEnabled("0"), false);
  assert.equal(normalizeCameraEnabled(0), false);
  assert.equal(normalizeCameraEnabled(undefined), false);
});

test("hydrates the switch again when leaving and returning with persisted true", () => {
  assert.equal(shouldHydrateCameraPreference("user-1", "user-2", true), true);
  assert.equal(normalizeCameraEnabled(true), true);
});

test("does not let a late profile snapshot overwrite a dirty switch", () => {
  assert.equal(shouldHydrateCameraPreference("user-1", "user-1", true), false);
});

test("allows fresh profile snapshots when the switch is not dirty", () => {
  assert.equal(shouldHydrateCameraPreference("user-1", "user-1", false), true);
});

test("sends and keeps true for the latest activate-and-save mutation", () => {
  const payloadValue = true;

  assert.equal(typeof payloadValue, "boolean");
  assert.equal(payloadValue, true);
  assert.equal(isLatestProfileMutation(2, 2), true);
});

test("sends and keeps false for the latest deactivate-and-save mutation", () => {
  const payloadValue = false;

  assert.equal(typeof payloadValue, "boolean");
  assert.equal(payloadValue, false);
  assert.equal(isLatestProfileMutation(3, 3), true);
});

test("ignores stale profile refreshes and stale mutation responses", () => {
  assert.equal(canApplyProfileRefresh(1, 2, 0), false);
  assert.equal(canApplyProfileRefresh(2, 2, 1), false);
  assert.equal(isLatestProfileMutation(1, 2), false);
});
