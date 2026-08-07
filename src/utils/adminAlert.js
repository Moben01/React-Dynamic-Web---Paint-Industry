import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import './adminAlert.css'

const sharedOptions = {
  buttonsStyling: false,
  heightAuto: false,
  allowOutsideClick: false,
  allowEscapeKey: true,
  reverseButtons: true,
  customClass: {
    popup: 'admin-swal-popup',
    title: 'admin-swal-title',
    htmlContainer: 'admin-swal-text',
    confirmButton: 'admin-swal-confirm',
    cancelButton: 'admin-swal-cancel',
    actions: 'admin-swal-actions',
  },
  didOpen: (popup) => {
    popup.setAttribute('dir', 'rtl')
  },
}

export const showAdminSuccess = (text, title = 'موفق شد') =>
  Swal.fire({
    ...sharedOptions,
    icon: 'success',
    title,
    text,
    confirmButtonText: 'باشه',
    timer: 1800,
    timerProgressBar: true,
    showConfirmButton: false,
  })

export const showAdminError = (text, title = 'خطا') =>
  Swal.fire({
    ...sharedOptions,
    icon: 'error',
    title,
    text,
    confirmButtonText: 'باشه',
  })

export const showAdminWarning = (text, title = 'توجه') =>
  Swal.fire({
    ...sharedOptions,
    icon: 'warning',
    title,
    text,
    confirmButtonText: 'باشه',
  })

export const showAdminInfo = (text, title = 'اطلاع') =>
  Swal.fire({
    ...sharedOptions,
    icon: 'info',
    title,
    text,
    confirmButtonText: 'باشه',
  })

export const confirmAdminAction = async ({
  title = 'آیا مطمئن هستید؟',
  text = '',
  confirmText = 'تأیید',
  cancelText = 'انصراف',
  icon = 'warning',
} = {}) => {
  const result = await Swal.fire({
    ...sharedOptions,
    icon,
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  })

  return result.isConfirmed
}
