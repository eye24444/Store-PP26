import { photoStyle } from '../lib/theme.js';

// Photo thumbnail with the diagonal-hatch "no photo" placeholder.
export default function Thumb({ size = 40, photo, showNoPhoto = true, style }) {
  return (
    <div style={{ ...photoStyle(size, photo), ...style }}>
      {!photo && showNoPhoto ? (
        <span>
          no
          <br />
          photo
        </span>
      ) : null}
    </div>
  );
}
