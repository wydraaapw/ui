import { useState, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import { notificationService } from "@/api/notificationService";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchUnreadCount = async () => {
        try {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error("Błąd licznika powiadomień:", error);
        }
    };

    useEffect(() => {
        void fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleOpenChange = async (open) => {
        setIsOpen(open);
        if (open) {
            setLoading(true);
            try {
                const list = await notificationService.getAll();
                setNotifications(list);
            } catch (error) {
                console.error("Błąd pobierania listy:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleMarkAllRead = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await notificationService.markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error(error);
        }
    };

    const handleMarkOneRead = async (id, e) => {
        e.stopPropagation();
        try {
            await notificationService.markAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error(error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("pl-PL", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    const renderNotificationsContent = () => {
        if (loading) {
            return (
                <div className="p-8 text-center text-sm text-muted-foreground">
                    Ładowanie...
                </div>
            );
        }

        if (notifications.length === 0) {
            return (
                <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                    <Bell className="h-8 w-8 opacity-20" />
                    <p>Brak nowych powiadomień</p>
                </div>
            );
        }

        return (
            <div className="flex flex-col">
                {notifications.map((notif) => {
                    const isUnread = !notif.isRead;
                    return (
                        <button
                            type="button"
                            key={notif.id}
                            onClick={(e) => isUnread && handleMarkOneRead(notif.id, e)}
                            className={cn(
                                "relative px-4 py-3 border-b last:border-0 transition-colors hover:bg-muted/50 flex gap-3 text-left w-full focus:outline-none focus:bg-muted/50",
                                isUnread
                                    ? "bg-blue-50/40 dark:bg-blue-900/10 cursor-pointer"
                                    : "bg-transparent cursor-default"
                            )}
                            tabIndex={0}
                        >
                            <div className="mt-1.5 shrink-0">
                                <div
                                    className={cn(
                                        "h-2 w-2 rounded-full transition-colors",
                                        isUnread ? "bg-blue-500" : "bg-transparent"
                                    )}
                                />
                            </div>

                            <div className="flex-1 space-y-1">
                                <div className="flex justify-between items-start gap-2">
                                    <p
                                        className={cn(
                                            "text-sm font-medium leading-none",
                                            isUnread ? "text-foreground" : "text-muted-foreground"
                                        )}
                                    >
                                        {notif.title}
                                    </p>
                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                        {formatDate(notif.sentAt)}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {notif.content}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
        );
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell
                        className={cn(
                            "h-5 w-5 transition-all",
                            unreadCount > 0 ? "text-primary" : "text-muted-foreground"
                        )}
                    />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-background"></span>
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-background sticky top-0 z-10">
                    <span className="font-semibold text-sm">Powiadomienia</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllRead}
                            className="h-auto p-0 text-xs text-primary hover:text-primary hover:bg-transparent hover:underline flex items-center gap-1 font-normal"
                        >
                            <Check className="h-3 w-3" /> Oznacz wszystkie
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[350px]">
                    {renderNotificationsContent()}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationBell;