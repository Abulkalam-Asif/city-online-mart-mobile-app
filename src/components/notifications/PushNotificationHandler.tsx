import React, { useCallback, useEffect } from "react";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { logger } from "@/src/utils/logger";
import type { PushNotificationData } from "@/src/types/notification.types";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/src/lib/react-query";

/**
 * Handle push notification responses and route to deep links when provided.
 * This component should be mounted once at app root.
 */
const PushNotificationHandler: React.FC = () => {
  const queryClient = useQueryClient();

  const extractOrderId = useCallback((deepLink: string): string | null => {
    try {
      const url = new URL(deepLink, "https://app.local");
      if (url.pathname !== "/order-details") return null;
      return url.searchParams.get("id");
    } catch (error) {
      logger.error("Push: Failed to parse deep link", error);
      return null;
    }
  }, []);

  const invalidateOrdersCache = useCallback(
    (orderId?: string | null) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.orders() });
      if (orderId) {
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.user.orders(), "detail", orderId],
        });
      }
    },
    [queryClient],
  );

  /**
   * Navigate based on notification response payload (if deepLink exists).
   */
  const handleNotificationResponse = useCallback(
    (response: Notifications.NotificationResponse): void => {
      // Payload data is attached to the notification content.
      const data =
        response.notification.request.content
          .data as PushNotificationData | undefined;
      // We only act if a deepLink string is present.
      const deepLink = typeof data?.deepLink === "string" ? data.deepLink : null;

      if (deepLink) {
        const orderId = extractOrderId(deepLink);
        invalidateOrdersCache(orderId);
        logger.info(`Push: Navigating to deep link ${deepLink}`);
        try {
          // Use expo-router navigation for in-app deep links.
          router.push(deepLink as any);
        } catch (error) {
          logger.error("Push: Failed to navigate to deep link", error);
        }
      } else {
        logger.info("Push: No deep link in notification payload");
      }
    },
    [extractOrderId, invalidateOrdersCache],
  );

  useEffect(() => {
    // Configure how notifications behave when received in the foreground.
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    const receivedSub = Notifications.addNotificationReceivedListener(
      (notification: Notifications.Notification) => {
        // Log incoming notification payload for debugging.
        const data =
          notification.request.content.data as PushNotificationData | undefined;
        const dataKeys = data ? Object.keys(data).join(", ") : "none";
        logger.info(
          `Push: Notification received (foreground). Data keys: ${dataKeys}`,
        );
      },
    );

    const responseSub =
      Notifications.addNotificationResponseReceivedListener(
        (response: Notifications.NotificationResponse) => {
        // Fired when the user taps a notification.
        logger.info("Push: Notification response received");
        handleNotificationResponse(response);
      },
      );

    // Handle the case where the app was launched from a notification tap.
    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (response) {
          logger.info("Push: Handling last notification response");
          handleNotificationResponse(response);
        }
      })
      .catch((error: unknown) => {
        logger.error("Push: Failed to get last notification response", error);
      });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, [handleNotificationResponse]);

  return null;
};

export default PushNotificationHandler;
