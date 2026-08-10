interface ProfilePicturePlaceholderProps {
  className?: string;
}

// Shown wherever a profile photo would go until the owner adds a real
// one via about.json's imageSource — a generic silhouette so the spot
// reads as an intentional design choice, never as a missing/broken image.
export function ProfilePicturePlaceholder({ className }: ProfilePicturePlaceholderProps) {
  return (
    <div
      role="img"
      aria-label="Profile photo coming soon"
      className={`flex items-center justify-center rounded-lg bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 ${className ?? ''}`}
    >
      <svg className="h-1/2 w-1/2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.4c-3.3 0-9.8 1.6-9.8 4.9v2.5h19.6v-2.5c0-3.3-6.5-4.9-9.8-4.9z" />
      </svg>
    </div>
  );
}
