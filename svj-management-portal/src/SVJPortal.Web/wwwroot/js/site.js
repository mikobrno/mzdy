// SVJ Management Portal JavaScript

$(document).ready(function() {
    // Initialize tooltips
    $('[data-bs-toggle="tooltip"]').tooltip();
    
    // Initialize popovers
    $('[data-bs-toggle="popover"]').popover();
    
    // Auto-hide alerts after 5 seconds
    $('.alert').delay(5000).fadeOut();
    
    // Confirmation dialogs
    $('[data-confirm]').on('click', function(e) {
        if (!confirm($(this).data('confirm'))) {
            e.preventDefault();
            return false;
        }
    });
    
    // Number formatting
    $('.currency').each(function() {
        var value = parseFloat($(this).text());
        if (!isNaN(value)) {
            $(this).text(formatCurrency(value));
        }
    });
    
    // Loading states for buttons
    $('.btn-loading').on('click', function() {
        var $btn = $(this);
        $btn.data('original-text', $btn.html());
        $btn.html('<span class="spinner-border spinner-border-sm" role="status"></span> Načítá...');
        $btn.prop('disabled', true);
    });
    
    // Reset loading states on page unload
    $(window).on('beforeunload', function() {
        $('.btn-loading').each(function() {
            var $btn = $(this);
            if ($btn.data('original-text')) {
                $btn.html($btn.data('original-text'));
                $btn.prop('disabled', false);
            }
        });
    });
});

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('cs-CZ', {
        style: 'currency',
        currency: 'CZK'
    }).format(amount);
}

function formatNumber(number) {
    return new Intl.NumberFormat('cs-CZ').format(number);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('cs-CZ').format(new Date(date));
}

function showToast(message, type = 'info') {
    if (typeof toastr !== 'undefined') {
        toastr[type](message);
    } else {
        alert(message);
    }
}

// AJAX helpers
function makeAjaxCall(url, data, method = 'GET', successCallback = null, errorCallback = null) {
    $.ajax({
        url: url,
        type: method,
        data: data,
        dataType: 'json',
        success: function(response) {
            if (successCallback) {
                successCallback(response);
            }
        },
        error: function(xhr, status, error) {
            if (errorCallback) {
                errorCallback(xhr, status, error);
            } else {
                showToast('Nastala chyba: ' + error, 'error');
            }
        }
    });
}

// Dashboard specific functions
function saveDashboardNote() {
    var note = $('#dashboardNote').val();
    makeAjaxCall('/Dashboard/SaveNote', { note: note }, 'POST',
        function(response) {
            if (response.success) {
                showToast('Poznámka byla uložena', 'success');
            }
        }
    );
}

function generatePayroll(svjId) {
    if (confirm('Opravdu chcete vygenerovat mzdy pro vybrané SVJ?')) {
        var $btn = $('#generateBtn');
        $btn.html('<span class="spinner-border spinner-border-sm"></span> Generuji...');
        $btn.prop('disabled', true);
        
        makeAjaxCall('/Dashboard/GeneratePayroll', { svjId: svjId }, 'POST',
            function(response) {
                if (response.success) {
                    showToast('Mzdy byly vygenerovány', 'success');
                    setTimeout(() => location.reload(), 2000);
                } else {
                    showToast('Chyba při generování mezd: ' + response.message, 'error');
                }
                $btn.html('Vygenerovat mzdy');
                $btn.prop('disabled', false);
            },
            function() {
                $btn.html('Vygenerovat mzdy');
                $btn.prop('disabled', false);
            }
        );
    }
}

// Form validation helpers
function validateForm($form) {
    var isValid = true;
    
    $form.find('[required]').each(function() {
        var $field = $(this);
        if (!$field.val().trim()) {
            $field.addClass('is-invalid');
            isValid = false;
        } else {
            $field.removeClass('is-invalid');
        }
    });
    
    // Validate email fields
    $form.find('[type="email"]').each(function() {
        var $field = $(this);
        var email = $field.val().trim();
        if (email && !isValidEmail(email)) {
            $field.addClass('is-invalid');
            isValid = false;
        }
    });
    
    // Validate IČO
    $form.find('[data-validate="ico"]').each(function() {
        var $field = $(this);
        var ico = $field.val().replace(/\s/g, '');
        if (ico && !isValidICO(ico)) {
            $field.addClass('is-invalid');
            isValid = false;
        }
    });
    
    return isValid;
}

function isValidEmail(email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function isValidICO(ico) {
    if (ico.length !== 8) return false;
    
    var sum = 0;
    for (var i = 0; i < 7; i++) {
        sum += parseInt(ico[i]) * (8 - i);
    }
    
    var remainder = sum % 11;
    var checkDigit = remainder < 2 ? remainder : 11 - remainder;
    
    return parseInt(ico[7]) === checkDigit;
}

// Auto-save functionality
function enableAutoSave(formSelector, saveUrl, interval = 30000) {
    var $form = $(formSelector);
    var lastData = $form.serialize();
    
    setInterval(function() {
        var currentData = $form.serialize();
        if (currentData !== lastData) {
            makeAjaxCall(saveUrl, currentData, 'POST',
                function(response) {
                    if (response.success) {
                        showToast('Automaticky uloženo', 'success');
                        lastData = currentData;
                    }
                }
            );
        }
    }, interval);
}

// Export functions
function exportToExcel(tableSelector, filename = 'export.xlsx') {
    // This would require a library like SheetJS
    showToast('Export do Excel není zatím implementován', 'warning');
}

function exportToPDF(url, data = {}) {
    var form = $('<form method="post" action="' + url + '">');
    
    $.each(data, function(key, value) {
        form.append('<input type="hidden" name="' + key + '" value="' + value + '">');
    });
    
    form.append('<input type="hidden" name="__RequestVerificationToken" value="' + $('[name="__RequestVerificationToken"]').val() + '">');
    
    $('body').append(form);
    form.submit();
    form.remove();
}

// Search and filter functionality
function initializeSearch(searchInputSelector, itemsSelector) {
    $(searchInputSelector).on('keyup', function() {
        var searchTerm = $(this).val().toLowerCase();
        
        $(itemsSelector).each(function() {
            var searchText = $(this).data('search') || $(this).text().toLowerCase();
            if (searchText.indexOf(searchTerm) > -1) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });
}

// Modal helpers
function showModal(modalId, title, body, buttons = []) {
    var modal = $('#' + modalId);
    if (modal.length === 0) {
        // Create modal if it doesn't exist
        modal = createModal(modalId);
        $('body').append(modal);
    }
    
    modal.find('.modal-title').text(title);
    modal.find('.modal-body').html(body);
    
    var footer = modal.find('.modal-footer');
    footer.empty();
    
    buttons.forEach(function(button) {
        footer.append('<button type="button" class="btn ' + button.class + '" data-bs-dismiss="modal">' + button.text + '</button>');
    });
    
    modal.modal('show');
}

function createModal(id) {
    return $(`
        <div class="modal fade" id="${id}" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"></h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body"></div>
                    <div class="modal-footer"></div>
                </div>
            </div>
        </div>
    `);
}
