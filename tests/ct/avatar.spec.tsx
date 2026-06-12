import { test, expect } from "@playwright/experimental-ct-react";
import { Avatar } from "@/app/components/ui/avatar";

test.use({ viewport: { width: 500, height: 500 } });

test("renders initials correctly", async ({ mount }) => {
  const component = await mount(
    <Avatar name="João Silva" color="#ff0000" />
  );
  await expect(component).toHaveText("JS");
  await expect(component).toHaveCSS("background-color", "rgb(255, 0, 0)");
});

test("renders one letter if single name", async ({ mount }) => {
  const component = await mount(
    <Avatar name="Maria" color="#00ff00" />
  );
  await expect(component).toHaveText("MA"); // getInitials usa substring(0,2) para 1 nome
});

test("applies sizes correctly", async ({ mount }) => {
  const component = await mount(
    <Avatar name="Teste" size="sm" />
  );
  await expect(component).toHaveClass(/w-8/);
  await expect(component).toHaveClass(/h-8/);
});
