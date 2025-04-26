import { ModeToggle } from "@/components/mode-toggle";
import { UserMenu } from "@/components/UserMenu";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LayoutDashboard, Menu, Sidebar as SidebarIcon } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar({ toggleLayout, layoutType }) {
  const navItems = [
    { title: "Home", href: "/" },
    { title: "Dashboard", href: "/dashboard" },
    { title: "Analytics", href: "/analytics" },
    { title: "Reports", href: "/reports" },
    { title: "Settings", href: "/settings" },
  ];

  return (
    <header className='sticky top-0 z-40 w-full border-b bg-background'>
      <div className='container flex h-16 items-center justify-between'>
        <div className='flex items-center gap-2 md:gap-6'>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant='outline' size='icon' className='md:hidden'>
                <Menu className='h-5 w-5' />
                <span className='sr-only'>Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side='left' className='pr-0'>
              <div className='px-7'>
                <Link to='/' className='flex items-center'>
                  <span className='text-xl font-bold'>Reach Dashboard</span>
                </Link>
              </div>
              <div className='mt-8 flex flex-col gap-4'>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className='block px-7 py-2 text-lg font-medium hover:bg-accent'
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <Link to='/' className='flex items-center space-x-2'>
            <span className='hidden text-xl font-bold sm:inline-block'>
              Reach Dashboard
            </span>
          </Link>

          <NavigationMenu className='hidden md:flex'>
            <NavigationMenuList>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <Link to={item.href}>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      {item.title}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className='flex items-center gap-2'>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleLayout}
            className="hidden md:flex"
            title={layoutType === 'navbar' ? 'Switch to Sidebar Layout' : 'Switch to Navbar Layout'}
          >
            {layoutType === 'navbar' ? (
              <LayoutDashboard className="h-5 w-5" />
            ) : (
              <SidebarIcon className="h-5 w-5" />
            )}
          </Button>
          <UserMenu />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
