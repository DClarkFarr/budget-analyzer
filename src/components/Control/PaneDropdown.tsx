import { useState } from "react";
import { FaCaretDown, FaCaretLeft } from "react-icons/fa";

export default function PaneDropdown({
    heading,
    headingIcon,
    children,
}: {
    children: React.ReactNode;
    heading: React.ReactNode;
    headingIcon?: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div className="pane-dropdown">
            <div
                className="heading px-6 py-3 flex w-full items-center gap-x-4 bg-gray-200"
                onClick={() => setOpen(!open)}
            >
                {heading}
                <div className="shrink align-self-end">
                    <div className="p-2 -m-2">
                        {!!headingIcon && headingIcon}
                        {!headingIcon &&
                            (open ? <FaCaretDown /> : <FaCaretLeft />)}
                    </div>
                </div>
            </div>
            {open && (
                <div className="pane-dropdown__body p-6 border border-gray-200 bg-white">
                    {children}
                </div>
            )}
        </div>
    );
}
