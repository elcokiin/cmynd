import { api } from "@elcokiin/backend/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@elcokiin/ui/avatar";
import { Button } from "@elcokiin/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@elcokiin/ui/dropdown-menu";
import { CameraIcon, User } from "lucide-react";
import { useState } from "react";
import { useQuery } from "convex/react";

import { AccountAvatarDialog } from "@/components/account/account-avatar-dialog";
import { authClient } from "@/lib/auth-client";

export function UserMenu() {
  const user = useQuery(api.auth.getCurrentUser);
  const accountImage = useQuery(api.authors.queries.getAccountImage);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="outline" />}
          className="p-1"
        >
          <Avatar size="default" className="size-7">
            {accountImage?.avatarUrl ? (
              <AvatarImage src={accountImage.avatarUrl} alt="Account avatar" />
            ) : null}
            <AvatarFallback>
              <User className="size-4" />
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-card data-open:fade-in-100! data-closed:fade-out-100!">
          <DropdownMenuGroup>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setAvatarDialogOpen(true);
              }}
            >
              <CameraIcon />
              Change avatar
            </DropdownMenuItem>
            <DropdownMenuItem>{user?.email}</DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      location.reload();
                    },
                  },
                });
              }}
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <AccountAvatarDialog
        open={avatarDialogOpen}
        onOpenChange={setAvatarDialogOpen}
      />
    </>
  );
}
