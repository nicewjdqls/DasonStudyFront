import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { PiSealCheckFill } from 'react-icons/pi';

const SuccessModal = (props) => {
    return (
        <Modal show={props.show} onHide={props.handleClose} centered>
            <Modal.Body className="modal-body">
                <PiSealCheckFill size={70} />
                <p>{props.text}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button 
                    className="p-button" 
                    variant="mb-3 p-1 px-3" 
                    onClick={props.handleClose}
                >
                    확인
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SuccessModal;