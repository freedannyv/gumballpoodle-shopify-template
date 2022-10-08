window.addEventListener('DOMContentLoaded', (event) => {
    const initBootstrapScript = () => {
        if (!document.querySelector('#bootstrap-js')) {
            const script = document.createElement('script')
            script.setAttribute('id', 'bootstrap-js')
            script.setAttribute('src', 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.min.js')
            script.setAttribute('integrity', 'sha256-cMPWkL3FzjuaFSfEYESYmjF25hCIL6mfRSPnW8OVvM4=')
            script.setAttribute('crossorigin', 'anonymous')
            document.head.appendChild(script)
        }
    }
    initBootstrapScript()


    // Open the cart drawer by URL if contains '#cart'
    if (window.location.hash.includes('#cart')) {
        setTimeout(() => {
            const offcanvas = bootstrap.Offcanvas.getOrCreateInstance('#cart-drawer');
            offcanvas.show()
        }, 250)
    }

    // Load cart drawer on ajax add/update
    window.loadEgCartDrawer = async () => {
        const $cartDrawer = document.querySelector('#cart-drawer')
        if (!$cartDrawer) return;

        const bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance($cartDrawer)
        bsOffcanvas.show()

        const $form = $cartDrawer.querySelector('form')
        $form.style.opacity = '.2'

        const respoonse = await fetch(window.location.href)
        const data = await respoonse.text()

        const parser = new DOMParser()
        const newDocument = parser.parseFromString(data, 'text/html')

        $form.replaceWith(newDocument.querySelector('#cart-drawer form'))


        document.querySelector('#cart-icon-bubble')
            ?.replaceWith(newDocument.querySelector('#cart-icon-bubble'))

        initCartDrawerQuantity()
        initCartDrawerRemoveButtons()
        initCartGoal()
        initCartUpsells()
        initCartNote()
    }

    // Handle quantity
    const initCartDrawerQuantity = () => {
        document.querySelectorAll('#cart-drawer quantity-input .quantity__input').forEach(($input) => {
            $input.addEventListener('change', async (e) => {
                await fetch('/cart/change.js', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        line: $input.dataset.index,
                        quantity: Number($input.value)
                    })
                })
                loadEgCartDrawer()
            })
        })
    }
    initCartDrawerQuantity()

    // Handle remove buttons
    const initCartDrawerRemoveButtons = () => {
        document.querySelectorAll('cart-remove-button a').forEach(($btn) => {
            $btn.addEventListener('click', async (e) => {
                e.preventDefault();

                await fetch('/cart/change.js', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        line: $btn.parentElement.dataset.index,
                        quantity: 0
                    })
                })
                loadEgCartDrawer()
            })
        })
    }
    initCartDrawerRemoveButtons()

    // Cart Goal - Animate width
    const initCartGoal = () => {
        const progressBar = document.querySelector('#eg-cart-drawer-goal .progress-bar')

        if (progressBar) {
            setTimeout(() => {
                progressBar.style.width = progressBar.dataset.width
            }, 250)
        }
    }
    initCartGoal()

    // Cart Upsells 
    const initCartUpsells = async () => {
        document.querySelectorAll('#eg-cart-drawer-upsells-list button').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault()

                btn.querySelector('span').classList.add('hidden')
                btn.querySelector('.loading-overlay__spinner').classList.remove('hidden')

                const variantId = btn.closest('.eg-cart-drawer-upsells-list-item').querySelector('select[name="id"]').value

                const response = await fetch('/cart/add.js', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: [{
                            id: Number(variantId),
                            quantity: 1
                        }]
                    })
                })

                const data = await response.json()
                console.log(data)

                loadEgCartDrawer()
            })
        }) 
    }
    initCartUpsells()

    // Cart Note
    const initCartNote = async () => {
        document.querySelectorAll('#eg-cart-drawer-note button').forEach((btn) => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault()

                btn.querySelector('span').classList.add('hidden')
                btn.querySelector('.loading-overlay__spinner').classList.remove('hidden')

                const note = document.querySelector('#eg-cart-drawer-note textarea').value

                const response = await fetch('/cart/update.js', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        note: note
                    })
                })
                const data = await response.json()
                console.log(data)

                btn.querySelector('span').classList.remove('hidden')
                btn.querySelector('span').textContent = '✓'
                btn.querySelector('.loading-overlay__spinner').classList.add('hidden')

                setTimeout(() => {
                    btn.querySelector('span').textContent = btn.dataset.text
                }, 2000)
            })
        })
    }
    initCartNote()
})