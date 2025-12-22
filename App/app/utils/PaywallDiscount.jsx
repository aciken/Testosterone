import RevenueCatUI from 'react-native-purchases-ui';
import { useRouter } from 'expo-router';
import { useGlobalContext } from '../context/GlobalProvider';
import Purchases from 'react-native-purchases';
import { useEffect, useState } from 'react';

export default function PaywallDiscount() {
  const router = useRouter();
  const { setIsPro, setIsNewUserOnboarding } = useGlobalContext();

  // RevenueCat OFFERING ID (dashboard)
  const OFFERING_ID = "ofrng53aaf648a6";

  const [offering, setOffering] = useState(null);

  // 🔹 Load offering
  useEffect(() => {
    async function loadOffering() {
      try {
        const offerings = await Purchases.getOfferings();
        const selectedOffering = offerings.all[OFFERING_ID];

        if (!selectedOffering) {
          console.error("Offering not found:", OFFERING_ID);
          return;
        }

        setOffering(selectedOffering);
      } catch (e) {
        console.error("Failed to load offerings:", e);
      }
    }

    loadOffering();
  }, []);

  const handlePurchaseCompleted = async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const isPro =
        customerInfo?.entitlements?.all?.pro?.isActive ?? false;

      setIsPro(isPro);
      setIsNewUserOnboarding(false);
      router.replace('/home');
    } catch (error) {
      console.error('Error handling purchase completion:', error);
    }
  };

  const handleRestoreCompleted = async (info) => {
    try {
      const isPro =
        info?.customerInfo?.entitlements?.all?.pro?.isActive ?? false;

      if (isPro) setIsPro(true);

      setIsNewUserOnboarding(false);
      router.replace('/home');
    } catch (error) {
      console.error('Error handling restore completion:', error);
    }
  };

  const handleCloseButton = () => {
    setIsNewUserOnboarding(false);
    router.replace('/onboarding/programPreview');
  };

  // ⛔ Prevent rendering before offering is loaded
  if (!offering) return null;

  return (
    <RevenueCatUI.Paywall
      offering={offering}
      onPurchaseCompleted={handlePurchaseCompleted}
      onRestoreCompleted={handleRestoreCompleted}
      onDismiss={handleCloseButton}
    />
  );
}
