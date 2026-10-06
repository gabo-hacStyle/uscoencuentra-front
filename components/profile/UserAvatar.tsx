type UserAvatarProps = {
  name: string;
  photoUrl?: string | null;
  className?: string; // define tamaño y posición
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/**
 * El borde blanco es el relleno (p-1.5) del contenedor EXTERNO; la imagen vive en un
 * contenedor interno con overflow-hidden: nada recorta la foto ni se mete encima de ella.
 */
export function UserAvatar({ name, photoUrl, className = "" }: UserAvatarProps) {
  return (
    <div className={`rounded-3xl bg-white p-1.5 shadow-md ${className}`}>
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[1.25rem] bg-usco-sand text-2xl font-bold text-usco-wine">
        {photoUrl ? (
          // TODO: con fotos reales del backend, usar next/image y registrar el dominio en
          // images.remotePatterns de next.config.ts.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={`Fotografía de ${name}`}
            referrerPolicy="no-referrer" // las fotos de Google a veces fallan si se envía el referrer
            className="h-full w-full object-cover"
          />
        ) : (
          <span aria-hidden="true">{getInitials(name)}</span>
        )}
      </div>
    </div>
  );
}