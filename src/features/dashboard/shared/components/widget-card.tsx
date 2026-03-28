"use client";

import {
  ChartNoAxesCombinedIcon,
  RefreshCcwIcon,
  XCircleIcon,
} from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { ErrorResponse, SuccessResponse } from "@/aactions/shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { WidgetCardProps } from "../types";

const WidgetCardInner = <T,>(props: WidgetCardProps<T>) => {
  const {
    icon: IconComponent = ChartNoAxesCombinedIcon,
    initialData,
    pollInterval = 0,
    transparent = false,
    title,
    fetchData,
    renderData,
  } = props;

  const [fetchedData, setFetchedData] = useState<
    SuccessResponse<T> | ErrorResponse | null
  >(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const _fetchData = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      setIsRefreshing(true);
      const res = await fetchData();

      setFetchedData(res as SuccessResponse<T> | ErrorResponse);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchData]);

  const startPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
    }
    if (pollInterval > 0) {
      pollTimerRef.current = setInterval(() => {
        _fetchData();
      }, pollInterval);
    }
  }, [_fetchData, pollInterval]);

  const handleManualRefresh = useCallback(() => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    _fetchData().then(() => startPolling());
  }, [_fetchData, startPolling]);

  useEffect(() => {
    if (pollInterval > 0 && initialData) {
      startPolling();
      return () => {
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      };
    }
  }, [pollInterval, startPolling, initialData]);

  // Derive state, data, and error
  const derivedData = fetchedData || initialData;
  const state =
    isRefreshing || !derivedData
      ? "loading"
      : (derivedData as unknown as SuccessResponse<T> | ErrorResponse).ok
        ? "success"
        : "error";

  const error = (derivedData as unknown as SuccessResponse<T> | ErrorResponse)
    ?.error;

  const errorContent = useCallback(
    () => (
      <div className="space-y-2">
        <p className="line-clamp-1 text-sm">{error}</p>
        <button
          type="button"
          className="flex items-center gap-1 text-xs hover:underline"
          onClick={handleManualRefresh}
        >
          <RefreshCcwIcon className="size-(--text-xs)" strokeWidth={2} />{" "}
          Refresh
        </button>
        {!transparent && (
          <XCircleIcon className="absolute right-5.5 bottom-0 z-0 size-25 translate-1/5 opacity-20" />
        )}
      </div>
    ),
    [error, handleManualRefresh],
  );

  const mainContent = useCallback(
    () => (
      <div className="flex-1">
        {!transparent && (
          <IconComponent
            className={cn(
              "dark:text-card-foreground absolute right-5.5 bottom-0 z-0 size-25 translate-1/5 text-(--txt)",
              state === "success" && derivedData ? "opacity-20" : "opacity-0",
            )}
          />
        )}
        {renderData(derivedData as T, state === "loading")}
      </div>
    ),
    [IconComponent, state, renderData, derivedData],
  );

  const content = state === "error" ? errorContent() : mainContent();

  return (
    <Card
      className={cn(
        "relative min-h-[132px] gap-1 overflow-hidden",
        state === "error" &&
          "!bg-destructive/30 dark:!bg-destructive/50 !border-destructive/30 !text-destructive",
        !transparent &&
          cn(
            "border-(--b) bg-(--bg)",
            // Green (4n+1)
            "[&:nth-child(4n+1)]:[--b:theme(colors.green.200)] [&:nth-child(4n+1)]:[--bg:theme(colors.green.50)] [&:nth-child(4n+1)]:[--txt:theme(colors.green.600)] dark:[&:nth-child(4n+1)]:[--b:theme(colors.green.800)] dark:[&:nth-child(4n+1)]:[--bg:theme(colors.green.950)]",
            // Blue (4n+2)
            "[&:nth-child(4n+2)]:[--b:theme(colors.blue.200)] [&:nth-child(4n+2)]:[--bg:theme(colors.blue.50)] [&:nth-child(4n+2)]:[--txt:theme(colors.blue.600)] dark:[&:nth-child(4n+2)]:[--b:theme(colors.blue.800)] dark:[&:nth-child(4n+2)]:[--bg:theme(colors.blue.950)]",
            // Pink (4n+3)
            "[&:nth-child(4n+3)]:[--b:theme(colors.pink.200)] [&:nth-child(4n+3)]:[--bg:theme(colors.pink.50)] [&:nth-child(4n+3)]:[--txt:theme(colors.pink.600)] dark:[&:nth-child(4n+3)]:[--b:theme(colors.pink.800)] dark:[&:nth-child(4n+3)]:[--bg:theme(colors.pink.950)]",
            // Amber (4n+4)
            "[&:nth-child(4n+4)]:[--b:theme(colors.amber.200)] [&:nth-child(4n+4)]:[--bg:theme(colors.amber.50)] [&:nth-child(4n+4)]:[--txt:theme(colors.amber.600)] dark:[&:nth-child(4n+4)]:[--b:theme(colors.amber.800)] dark:[&:nth-child(4n+4)]:[--bg:theme(colors.amber.950)]",
            state === "loading" && "cursor-progress",
          ),
      )}
    >
      <CardHeader>
        <CardTitle
          className={cn(
            "text-sm",
            state === "error"
              ? "text-destructive"
              : "dark:text-card-foreground text-(--txt)",
          )}
        >
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
};

const WidgetLoading = () => (
  <>
    <Skeleton className="mt-2 mb-2 h-(--text-2xl) w-1/4 bg-(--b)" />
    <Skeleton className="h-(--text-xs) w-1/2 bg-(--b)" />
  </>
);

const WidgetCard = memo(WidgetCardInner) as <T>(
  props: WidgetCardProps<T>,
) => React.ReactElement;

export { WidgetCard, WidgetLoading };
