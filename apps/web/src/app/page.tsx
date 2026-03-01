import { services } from "@atl.tools/manifest"
import { AppShell } from "@/components/app-shell"

export default function HomePage() {
	return <AppShell services={services} />
}
