import { use, useEffect, useRef, useState, useTransition } from "react";

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
  const [internalActiveTab, setActiveTab] = useState(activeTab || tabs[0].key);

  useEffect(() => {
    if (activeTab) {
      setActiveTab(activeTab);
    }
  }, [activeTab]);

  const handleTabChange = (tab: string) => {
    if (typeof onTabChange === "function") {
      onTabChange(tab);
    } else {
      setActiveTab(tab);
    }
  };

  const activeTabContent = useRef<React.ReactNode>(
    tabs.find((tab) => tab.key === internalActiveTab)?.pane
  );

  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      activeTabContent.current = tabs.find(
        (tab) => tab.key === internalActiveTab
      )?.pane;
    });
  }, [internalActiveTab, tabs]);

  return (
    <div className="tabs-view">
      <div className="tabs-view__tabs flex gap-x-1 flex-wrap border-b border-b-slate-500">
        {tabs.map((tab) => (
          <div
            key={tab.key}
            className={`tabs-view__tab p-2 pb-1 rounded-t-lg cursor-pointer ${
              internalActiveTab === tab.key ? "active" : ""
            }`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </div>
        ))}
      </div>
      <div className="tabs-view__content p-4">{activeTabContent.current}</div>
    </div>
  );
}
