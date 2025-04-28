document.addEventListener('DOMContentLoaded', function() {
  // Auto-dismiss alerts after 5 seconds
  setTimeout(function() {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(function(alert) {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    });
  }, 5000);

  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function(tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // File input preview for package images
  const packageImageInput = document.getElementById('package_images');
  if (packageImageInput) {
    packageImageInput.addEventListener('change', function(event) {
      const previewContainer = document.createElement('div');
      previewContainer.className = 'row g-2 mt-2';
      
      if (this.files.length > 0) {
        for (let i = 0; i < this.files.length; i++) {
          const file = this.files[i];
          if (!file.type.match('image.*')) continue;
          
          const reader = new FileReader();
          const previewCol = document.createElement('div');
          previewCol.className = 'col-4 mb-2';
          
          reader.onload = function(e) {
            const previewImg = document.createElement('img');
            previewImg.src = e.target.result;
            previewImg.className = 'img-thumbnail';
            previewImg.style.height = '100px';
            previewImg.style.objectFit = 'cover';
            
            previewCol.appendChild(previewImg);
          };
          
          reader.readAsDataURL(file);
          previewContainer.appendChild(previewCol);
        }
        
        // Remove existing preview
        const existingPreview = packageImageInput.nextElementSibling;
        if (existingPreview && existingPreview.classList.contains('row')) {
          existingPreview.remove();
        }
        
        packageImageInput.parentNode.insertBefore(previewContainer, packageImageInput.nextSibling);
      }
    });
  }

  // Confirm deletion
  const deleteButtons = document.querySelectorAll('.delete-btn');
  deleteButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
        e.preventDefault();
      }
    });
  });

  // Price input formatting
  const priceInput = document.getElementById('price');
  if (priceInput) {
    priceInput.addEventListener('input', function(e) {
      // Remove all characters except numbers and commas
      let value = this.value.replace(/[^\d,]/g, '');
      
      // Format with commas for thousands
      value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      
      this.value = value;
    });
  }
});

// Star rating display
function displayRating(rating, element) {
  let starsHtml = '';
  
  for (let i = 0; i < 5; i++) {
    if (i < Math.floor(rating)) {
      starsHtml += '<i class="fas fa-star text-warning"></i>';
    } else if (i < rating) {
      starsHtml += '<i class="fas fa-star-half-alt text-warning"></i>';
    } else {
      starsHtml += '<i class="far fa-star text-warning"></i>';
    }
  }
  
  starsHtml += `<small class="ms-1">(${rating})</small>`;
  element.innerHTML = starsHtml;
}