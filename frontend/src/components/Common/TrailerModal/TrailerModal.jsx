/**
 * =============================================================================
 * TRAILER MODAL - Modal phát video trailer (Chỉ video, không header)
 * =============================================================================
 * Vị trí: src/components/Common/TrailerModal/TrailerModal.jsx
 *
 * Chức năng:
 * - Hiển thị popup video trailer từ YouTube
 * - Chỉ có video + nút X đóng ở góc
 * - Đóng khi click overlay hoặc nút X
 *
 * Props:
 * - open: Boolean - mở/đóng modal
 * - onClose: Function - callback khi đóng
 * - trailerUrl: String - URL embed YouTube
 * - movieTitle: String - tên phim (cho title iframe)
 *
 * Dependencies: @mui/material, @mui/icons-material
 * =============================================================================
 */

import {
  Dialog,
  IconButton,
  Box
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

// ============================================================================
// STYLES - Chỉ video, nút X ở góc
// ============================================================================
const styles = {
  dialog: {
    '& .MuiDialog-paper': {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      maxWidth: 1200,
      width: '95vw',
      m: 0,
      borderRadius: 0,
      overflow: 'visible'
    },
    '& .MuiBackdrop-root': {
      backgroundColor: 'rgba(0,0,0,0.92)'
    }
  },
  container: {
    position: 'relative',
    width: '100%'
  },
  closeButton: {
    position: 'absolute',
    top: -45,
    right: 0,
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.5)',
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.2)'
    },
    zIndex: 10
  },
  videoContainer: {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#000',
    borderRadius: 1,
    overflow: 'hidden'
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
    display: 'block'
  }
};

// ============================================================================
// TRAILER MODAL COMPONENT
// ============================================================================
function TrailerModal({ open, onClose, trailerUrl, movieTitle }) {
  // --------------------------------------------------------------------------
  // Chuyển đổi URL YouTube sang embed URL nếu cần
  // --------------------------------------------------------------------------
  const getEmbedUrl = (url) => {
    if (!url) return '';

    // Nếu đã là embed URL
    if (url.includes('embed')) {
      return url.includes('?') ? `${url}&autoplay=1` : `${url}?autoplay=1`;
    }

    // Chuyển đổi từ watch URL
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
  };

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      sx={styles.dialog}
    >
      <Box sx={styles.container}>
        {/* Nút đóng ở góc trên phải */}
        <IconButton onClick={onClose} sx={styles.closeButton} aria-label="Đóng">
          <CloseIcon />
        </IconButton>

        {/* Video - Chiếm toàn bộ */}
        <Box sx={styles.videoContainer}>
          {trailerUrl && (
            <Box
              component="iframe"
              src={getEmbedUrl(trailerUrl)}
              title={`Trailer - ${movieTitle}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              sx={styles.iframe}
            />
          )}
        </Box>
      </Box>
    </Dialog>
  );
}

export default TrailerModal;
