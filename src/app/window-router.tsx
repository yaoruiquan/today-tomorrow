import { PanelView } from "./views/panel-view";
import { PetView } from "./views/pet-view";

export function WindowRouter() {
  const params = new URLSearchParams(window.location.search);
  const windowType = params.get("window");

  if (windowType === "panel") {
    return <PanelView />;
  }

  return <PetView />;
}
