import { test, expect } from "@playwright/experimental-ct-react";
import { Badge } from "@/app/components/ui/badge";

test.use({ viewport: { width: 500, height: 500 } });

test("does not render when count is 0", async ({ mount }) => {
  const component = await mount(<Badge count={0} />);
  // Count = 0 should return null
  await expect(component).toBeEmpty();
});

test("renders count correctly", async ({ mount }) => {
  const component = await mount(<Badge count={5} />);
  await expect(component).toHaveText("5");
});

test("renders 99+ when count is greater than 99", async ({ mount }) => {
  const component = await mount(<Badge count={150} />);
  await expect(component).toHaveText("99+");
});
