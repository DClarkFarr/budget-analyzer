import { use, useEffect, useRef, useState, useTransition } from "react";

import "./TabsView.scss";
import useQueryParams from "@/hooks/useQueryParams";

type PaneTab = {
    label: string;
    key: string;
    pane: React.ReactNode;
    type: "pane";
};
type LinkTab = {
    label: string;
    key: string;
    href: string;
    type: "link";
};
export type Tab = PaneTab | LinkTab;

export default function TabsView({
    tabs,
    activeTab,
    onTabChange,
}: {
    tabs: Tab[];
    activeTab?: string;
    onTabChange?: (tab: string) => void;
}) {
    const [internalActiveTab, setActiveTab] = useState(
        activeTab || tabs[0].key
    );

    const { redirect } = useQueryParams();

    useEffect(() => {
        if (activeTab) {
            setActiveTab(activeTab);
        }
    }, [activeTab]);

    const handleTabChange = (tabName: string) => {
        const targetTab = tabs.find((tab) => tab.key === tabName)!;

        if (targetTab.type === "pane") {
            if (typeof onTabChange === "function") {
                onTabChange(tabName);
            } else {
                setActiveTab(tabName);
            }
        } else if (targetTab.type === "link") {
            redirect(targetTab.href, { view: "" });
        }
    };

    const activeTabContent = useRef<React.ReactNode>(
        (tabs as PaneTab[])
            .filter((t) => t.type === "pane")
            .find((tab) => tab.key === internalActiveTab)?.pane
    );

    const [, startTransition] = useTransition();

    useEffect(() => {
        startTransition(() => {
            activeTabContent.current = (tabs as PaneTab[])
                .filter((t) => t.type === "pane")
                .find((tab) => tab.key === internalActiveTab)?.pane;
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
            <div className="tabs-view__content p-4">
                {activeTabContent.current}
            </div>
        </div>
    );
}
