import Image from "next/image";

export function SidebarHeader() {
  return (
    <div className="sticky top-0 z-10 mb-6 flex items-center justify-center bg-gray-200 pb-6 pt-3">
      <Image src="/images/user.jpg" width={80} height={90} alt="Nom de l'utilisateur" className="rounded-full"/>
    </div>
  );
}
