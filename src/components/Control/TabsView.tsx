import { useEffect, useRef } from "react";

import "./TabsView.scss";

export type Tab = {
  label: string;
  key: string;
  pane: React.ReactNode;
};

export default function TabsView({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: Tab[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}) {
  const internalActiveTab = useRef(activeTab || tabs[0].key);

  useEffect(() => {
    if (activeTab) {
      internalActiveTab.current = activeTab;
    }
  }, [activeTab]);

  const handleTabChange = (tab: string) => {
    if (typeof onTabChange === "function") {
      onTabChange(tab);
    } else {
      internalActiveTab.current = tab;
    }
  };

  return (
    <div className="tabs-view">
      <div className="tabs-view__tabs flex gap-x-1 flex-wrap border-b border-b-slate-500">
        {tabs.map((tab) => (
          <div
            key={tab.key}
            className={`tabs-view__tab p-2 pb-1 rounded-t-lg cursor-pointer ${
              internalActiveTab.current === tab.key ? "active" : ""
            }`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </div>
        ))}
      </div>
      <div className="tabs-view__content p-4">
        {tabs.find((tab) => tab.key === internalActiveTab.current)?.pane}
      </div>
    </div>
  );
}
