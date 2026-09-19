import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "./useLocalStorage";

type Mode = "cards" | "list";
const isMode = (value: string): value is Mode =>
  value === "cards" || value === "list";

describe("useLocalStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns the default value when nothing is stored", () => {
    const { result } = renderHook(() =>
      useLocalStorage("view-mode", "cards" as Mode, isMode)
    );

    expect(result.current[0]).toBe("cards");
  });

  it("adopts a previously stored valid value", () => {
    window.localStorage.setItem("view-mode", "list");

    const { result } = renderHook(() =>
      useLocalStorage("view-mode", "cards" as Mode, isMode)
    );

    expect(result.current[0]).toBe("list");
  });

  it("falls back to the default when the stored value is invalid", () => {
    window.localStorage.setItem("view-mode", "not-a-mode");

    const { result } = renderHook(() =>
      useLocalStorage("view-mode", "cards" as Mode, isMode)
    );

    expect(result.current[0]).toBe("cards");
  });

  it("updates the value and persists it to localStorage", () => {
    const { result } = renderHook(() =>
      useLocalStorage("view-mode", "cards" as Mode, isMode)
    );

    act(() => {
      result.current[1]("list");
    });

    expect(result.current[0]).toBe("list");
    expect(window.localStorage.getItem("view-mode")).toBe("list");
  });

  it("keeps separate values isolated by key", () => {
    window.localStorage.setItem("key-a", "list");

    const { result } = renderHook(() =>
      useLocalStorage("key-b", "cards" as Mode, isMode)
    );

    expect(result.current[0]).toBe("cards");
  });

  it("uses the fallback instead of the static default when nothing is stored", () => {
    const { result } = renderHook(() =>
      useLocalStorage("view-mode", "cards" as Mode, isMode, () => "list")
    );

    expect(result.current[0]).toBe("list");
  });

  it("prefers a stored value over the fallback", () => {
    window.localStorage.setItem("view-mode", "cards");

    const { result } = renderHook(() =>
      useLocalStorage("view-mode", "cards" as Mode, isMode, () => "list")
    );

    expect(result.current[0]).toBe("cards");
  });

  it("does not persist the fallback value to localStorage", () => {
    renderHook(() =>
      useLocalStorage("view-mode", "cards" as Mode, isMode, () => "list")
    );

    expect(window.localStorage.getItem("view-mode")).toBeNull();
  });
});
