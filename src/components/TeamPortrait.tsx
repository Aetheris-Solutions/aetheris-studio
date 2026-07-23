import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, RefObject } from 'react';
import type { ResponsiveTeamImage, TeamMember } from '../content/team';

type TeamPortraitProps = {
  member: TeamMember;
};

function TeamPicture({
  image,
  className,
  imageRef,
  onLoad,
  onError,
}: {
  image: ResponsiveTeamImage;
  className: string;
  imageRef?: RefObject<HTMLImageElement | null>;
  onLoad?: () => void;
  onError?: () => void;
}) {
  return (
    <picture className={className} aria-hidden="true">
      <source type="image/avif" srcSet={image.avif} sizes="(max-width: 680px) 50vw, (max-width: 1180px) 33vw, 17vw" />
      <source type="image/webp" srcSet={image.webp} sizes="(max-width: 680px) 50vw, (max-width: 1180px) 33vw, 17vw" />
      <img
        ref={imageRef}
        src={image.fallback}
        alt=""
        width={image.width}
        height={image.height}
        loading="lazy"
        decoding="async"
        onLoad={onLoad}
        onError={onError}
      />
    </picture>
  );
}

export function TeamPortrait({ member }: TeamPortraitProps) {
  const realImageRef = useRef<HTMLImageElement>(null);
  const [realReady, setRealReady] = useState(false);
  const [showReal, setShowReal] = useState(false);

  const decodeRealPortrait = () => {
    const image = realImageRef.current;
    if (!image || image.naturalWidth === 0) return;
    image.decode?.().then(() => setRealReady(true)).catch(() => setRealReady(true));
  };

  useEffect(() => {
    const image = realImageRef.current;
    if (!image || !image.complete || image.naturalWidth === 0) return;
    decodeRealPortrait();
  }, []);

  const revealRealPortrait = () => {
    if (realReady) setShowReal((visible) => !visible);
  };

  const frameStyle = {
    '--team-painted-position': member.portrait.paintedPosition ?? '50% 50%',
    '--team-real-position': member.portrait.realPosition ?? '50% 50%',
  } as CSSProperties;

  return (
    <article className="team-portrait">
      <button
        type="button"
        className={`team-portrait-trigger${realReady ? ' is-ready' : ''}${showReal ? ' is-real' : ''}`}
        aria-label={`${showReal ? 'Return to the painted portrait of' : 'Reveal the real portrait of'} ${member.name}`}
        aria-pressed={showReal}
        onClick={revealRealPortrait}
      >
        <span className="team-portrait-frame" style={frameStyle}>
          <TeamPicture
            image={member.portrait.painted}
            className="team-portrait-picture team-portrait-picture--painted"
          />
          <TeamPicture
            image={member.portrait.real}
            className="team-portrait-picture team-portrait-picture--real"
            imageRef={realImageRef}
            onLoad={decodeRealPortrait}
            onError={() => {
              setRealReady(false);
              setShowReal(false);
            }}
          />
          <span className="team-portrait-wash" aria-hidden="true" />
          <span className="team-portrait-hint" aria-hidden="true">
            <span className="team-portrait-hint-painted">Reveal portrait</span>
            <span className="team-portrait-hint-real">Return to fresco</span>
          </span>
        </span>
      </button>

      <div className="team-portrait-caption">
        <div>
          <h4>{member.name}</h4>
          <p>{member.role}</p>
        </div>
        <p>{member.responsibility}</p>
        {member.profileUrl ? (
          <a href={member.profileUrl} target="_blank" rel="noreferrer">
            Profile <span aria-hidden="true">↗</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}
