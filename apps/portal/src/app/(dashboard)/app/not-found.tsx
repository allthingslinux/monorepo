import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { connection } from "next/server";

import { Button } from "@atl/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@atl/ui/components/card";

export default async function AppNotFound() {
  await connection();
  // Use getTranslations() for server components
  // This helps i18n-ally detect the complete namespace.key path
  const t = await getTranslations();

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-6xl font-bold">404</CardTitle>
          <CardDescription className="text-lg">
            {t("error.notFound.title")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t("error.notFound.description")}
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-2">
          <Button
            nativeButton={false}
            render={<Link href="/app" />}
            variant="default"
          >
            {t("navigation.backToDashboard")}
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/" />}
            variant="outline"
          >
            {t("error.notFound.goHome")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
