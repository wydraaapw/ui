import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetHeader,
    SheetTitle
} from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    UtensilsCrossed,
    Menu,
    User,
    CalendarDays,
    Bell,
    LogOut,
    ChevronDown,
    LayoutDashboard
} from "lucide-react";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const closeMenu = () => setIsOpen(false);

    const handleLogout = () => {
        logout();
        closeMenu();
        navigate("/");
    };

    const rolePaths = {
        ROLE_ADMIN: "/admin",
        ROLE_WAITER: "/waiter",
        ROLE_CLIENT: "/client",
    };

    const logoPath = rolePaths[user?.role] ?? "/";

    const isClient = user?.role === 'ROLE_CLIENT';
    const isAdmin = user?.role === 'ROLE_ADMIN';

    return (
        <nav className="border-b bg-white shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">

                <Link to={logoPath} className="flex items-center gap-2 font-bold text-xl text-primary">
                    <UtensilsCrossed className="h-6 w-6" />
                    <span>DobreSmaki</span>
                </Link>

                <div className="hidden md:flex gap-6 text-sm font-medium text-gray-600 items-center">
                    {!isAdmin && (
                        <>
                            <Link to="/menu" className="hover:text-primary transition">Menu</Link>
                            <Link to="/opinions" className="text-gray-600 hover:text-primary transition-colors">
                                Opinie
                            </Link>
                        </>
                    )}

                    {isClient && (
                        <Link to="/reservations" className="hover:text-primary transition font-semibold text-primary">
                            Zarezerwuj stolik
                        </Link>
                    )}

                    {isAdmin && (
                        <Link to="/admin" className="hover:text-primary transition font-semibold text-primary flex items-center gap-1">
                            <LayoutDashboard className="h-4 w-4" />
                            Panel Administratora
                        </Link>
                    )}
                </div>

                <div className="hidden md:flex items-center gap-4">
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span>{user.firstName}</span>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>
                                    Moje Konto ({user.role === 'ROLE_CLIENT' ? 'Klient' : user.role === 'ROLE_ADMIN' ? 'Admin' : 'Personel'})
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                {isClient && (
                                    <>
                                        <DropdownMenuItem asChild>
                                            <Link to="/my-reservations" className="cursor-pointer">
                                                <CalendarDays className="mr-2 h-4 w-4" />
                                                <span>Moje Rezerwacje</span>
                                            </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem asChild>
                                            <Link to="/notifications" className="cursor-pointer">
                                                <Bell className="mr-2 h-4 w-4" />
                                                <span>Powiadomienia</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </>
                                )}

                                {isAdmin && (
                                    <DropdownMenuItem asChild>
                                        <Link to="/admin" className="cursor-pointer">
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            <span>Panel Administratora</span>
                                        </Link>
                                    </DropdownMenuItem>
                                )}

                                <DropdownMenuItem asChild>
                                    <Link to="/account" className="cursor-pointer">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Informacje o koncie</span>
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer focus:text-red-600">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Wyloguj się</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Button variant="ghost" asChild>
                                <Link to="/login">Logowanie</Link>
                            </Button>
                            <Button asChild>
                                <Link to="/register">Rejestracja</Link>
                            </Button>
                        </>
                    )}
                </div>

                <div className="md:hidden">
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Otwórz menu</span>
                            </Button>
                        </SheetTrigger>

                        <SheetContent side="right">
                            <SheetHeader>
                                <SheetTitle className="text-left">DobreSmaki</SheetTitle>
                            </SheetHeader>

                            <div className="flex flex-col gap-4 mt-8">
                                {!isAdmin && (
                                    <>
                                        <Link to="/menu" onClick={closeMenu} className="text-lg font-medium hover:text-primary">
                                            Menu
                                        </Link>
                                        <Link to="/opinions" onClick={closeMenu} className="text-lg font-medium hover:text-primary">
                                            Opinie
                                        </Link>
                                    </>
                                )}

                                {isClient && (
                                    <Link to="/reservations" onClick={closeMenu} className="text-lg font-medium text-primary">
                                        Zarezerwuj stolik
                                    </Link>
                                )}

                                {isAdmin && (
                                    <Link to="/admin" onClick={closeMenu} className="text-lg font-medium text-primary flex items-center gap-2">
                                        <LayoutDashboard className="h-5 w-5" />
                                        Panel Administratora
                                    </Link>
                                )}

                                <hr className="my-2" />

                                {user ? (
                                    <div className="flex flex-col gap-4">
                                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                                            Profil: {user.firstName}
                                        </p>

                                        {isClient && (
                                            <>
                                                <Link to="/my-reservations" onClick={closeMenu} className="flex items-center gap-3 text-lg hover:text-primary">
                                                    <CalendarDays className="h-5 w-5" />
                                                    Moje Rezerwacje
                                                </Link>

                                                <Link to="/notifications" onClick={closeMenu} className="flex items-center gap-3 text-lg hover:text-primary">
                                                    <Bell className="h-5 w-5" />
                                                    Powiadomienia
                                                </Link>
                                            </>
                                        )}

                                        <Link to="/account" onClick={closeMenu} className="flex items-center gap-3 text-lg hover:text-primary">
                                            <User className="h-5 w-5" />
                                            Informacje o koncie
                                        </Link>

                                        <Button variant="outline" onClick={handleLogout} className="mt-4 border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Wyloguj się
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <Button variant="outline" asChild onClick={closeMenu}>
                                            <Link to="/login">Zaloguj się</Link>
                                        </Button>
                                        <Button asChild onClick={closeMenu}>
                                            <Link to="/register">Zarejestruj się</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

            </div>
        </nav>
    );
};

export default Navbar;