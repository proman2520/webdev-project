Swal.fire({
    title: 'Are you sure?',
    text: "The government may be watching.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'My eyes are open.',
    allowOutsideClick: false,
    backdrop: 'static',
    showCancelButton: false,
    denyButtonText: 'Better not.',
    showDenyButton: true
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire(
        'Enter',
        'You have been warned.',
        'success'
      )
    } else if (result.isDenied) {
      window.location.href = 'index.html';
    }
  })