// Generic modal helper functions for add/edit operations

/**
 * Opens a modal in either 'add' or 'edit' mode
 * @param {string} modalId - The ID of the modal element
 * @param {string} mode - Either 'add' or 'edit'
 * @param {object} data - Data object to populate the form (for edit mode)
 */
function openModal(modalId, mode = 'add', data = {}) {
    const modal = document.getElementById(modalId);
    const form = document.getElementById(modalId + '-form');
    const title = document.getElementById(modalId + '-title');
    const modeInput = document.getElementById(modalId + '-mode');
    const idInput = document.getElementById(modalId + '-id');
    
    if (!modal || !form || !title) {
        console.error('Modal elements not found');
        return;
    }
    
    // Clear form
    form.reset();
    
    // Set mode
    if (modeInput) {
        modeInput.value = mode;
    }
    
    // Update title and populate form based on mode
    if (mode === 'edit') {
        const originalTitle = title.getAttribute('data-original-title') || title.textContent;
        title.textContent = originalTitle.replace('Add', 'Edit');
        
        // Set the ID for editing (check for common primary key field names)
        if (idInput) {
            // Try different common ID field names
            const idValue = data.username || data.donationid || data.participantid || 
                           data.eventid || data.milestoneid || data.surveyid || data.id;
            if (idValue) {
                idInput.value = idValue;
            }
        }
        
        // Populate form with data
        Object.keys(data).forEach(key => {
            // Check for radio buttons first (they have multiple elements with same name)
            const radioButtons = document.querySelectorAll(`input[type="radio"][name="${key}"]`);
            if (radioButtons.length > 0) {
                // It's a radio button group
                radioButtons.forEach(radio => {
                    if (radio.value === String(data[key])) {
                        radio.checked = true;
                    }
                });
            } else {
                // Regular input field (text, select, etc.)
                const field = document.getElementById(modalId + '-' + key);
                if (field) {
                    field.value = data[key];
                }
            }
        });
    } else {
        const originalTitle = title.getAttribute('data-original-title') || title.textContent;
        title.textContent = originalTitle.replace('Edit', 'Add');
        
        // Clear ID field for add mode
        if (idInput) {
            idInput.value = '';
        }
    }
    
    // Store original title if not already stored
    if (!title.getAttribute('data-original-title')) {
        title.setAttribute('data-original-title', title.textContent);
    }
    
    // Show modal
    modal.style.display = 'block';
}

/**
 * Closes a modal
 * @param {string} modalId - The ID of the modal element to close
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Note: deleteRecord function removed - use openDeleteModal from deleteConfirmModal.ejs instead

// Close modal when clicking outside of it
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Close modal on ESC key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    }
});

