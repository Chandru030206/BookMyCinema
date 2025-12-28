import './Modal.css';

const Modal = ({ isOpen, onClose, type = 'success', title, message, bookingId, children }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={handleOverlayClick}>
      <div className="modal">
        <div className={`modal-icon ${type}`}>
          <i className={`fas ${type === 'success' ? 'fa-check' : type === 'error' ? 'fa-times' : 'fa-clock'}`}></i>
        </div>
        <h2>{title}</h2>
        <p>{message}</p>
        
        {bookingId && (
          <div className="booking-id">
            Booking ID: <span>{bookingId}</span>
          </div>
        )}
        
        {children}
      </div>
    </div>
  );
};

export default Modal;
