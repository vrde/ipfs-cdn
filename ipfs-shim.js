(function() {
  const SIGNATURE = {
    "89504e47": "image/png",
    "47494638": "image/gif",
    ffd8ffdb: "image/jpeg",
    ffd8ffe0: "image/jpeg",
    ffd8ffe1: "image/jpeg",
    ffd8ffe2: "image/jpeg",
    ffd8ffe3: "image/jpeg",
    ffd8ffe8: "image/jpeg"
    //'25504446': 'application/pdf',
  };

  // # Watch changes in the DOM
  //
  // This module takes care of triggering events when the DOM changes.
  function watch(root, selector, callback) {
    // ## `watch(root, selector, callback)`
    //
    // Watch for changes and do something. Since the DOM can be quite big, the
    // function requires a `root` to select which part of the DOM to observe.
    // Every time a child of the `root` is added, removed, or changed, this
    // function will check if `selector` matches any of the changes. If so,
    // `callback` is triggered using `element` as the only argument.
    //
    // ### Implementation details
    //
    // First we need to instantiate a new
    // [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
    // object. It will be responsible to watch for changes being made in the
    // DOM tree. We initialize it with a callback function that takes an array
    // of mutations. Watch out because things are gonna be _nesty_ here (hehe
    // pun intended).
    const mutationObserver = new MutationObserver(mutations =>
      // Each `mutation` in the `mutations` array contains an...
      mutations.forEach(mutation => {
        console.log("mutation", mutation);
        // ...array of added nodes. We need to iterate all of the nodes.
        mutation.addedNodes.forEach(
          node =>
            // We analyze each `node`, if it is an `Element` then it implements
            // the `querySelectorAll` interface, that we use to match our
            // `selector`.  For each element matching the selector, we finally
            // trigger `callback` with the matching element.
            node instanceof Element &&
            node
              .querySelectorAll(selector)
              .forEach(element => callback(element))
        );
      })
    );

    // We want this function to trigger `callback` on elements that are already
    // in the DOM. Note that this function works asynchronously, and we expect
    // to start triggering `callback`s after it has been called.  To avoid the
    // execution of `callback` to be synchronous, we wrap it in a `setTimeout`
    // with timeout `0` to execute this piece of code in the next event loop.
    setTimeout(() => {
      // Query for all elements and run `callback`.
      root.querySelectorAll(selector).forEach(callback);

      // Start observing events on `root`, using the configuration specified.
      // For more information about the configuration parameters, check the
      // [MutationObserverInit
      // documentation](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserverInit).
      mutationObserver.observe(root, {
        childList: true,
        subtree: true,
        attributes: true
      });
    }, 0);

    return mutationObserver;
  }

  async function toDataURL(raw) {
    const signature = raw.slice(0, 4).toString("hex");
    const mimetype = SIGNATURE[signature];

    if (!mimetype) {
      throw new Error("Cannot find signature", signature);
    }

    return `data:${mimetype};base64,${raw.toString("base64")}`;

    // return new Promise((resolve, reject) => {
    //   const reader = new FileReader();
    //   reader.onloadend = () => resolve(reader.result);
    //   reader.onerror = reject;
    //   reader.readAsDataURL(blob);
    // });
  }

  async function loadUrl(ipfs, e) {
    const src = e.attributes.src.nodeValue;
    console.log("loadUrl", src);
    if (!src.startsWith("ipfs://")) {
      return;
    }

    const cid = src.substr(7);
    const raw = await ipfs.cat(cid);
    const data = await toDataURL(raw);
    e.src = data;
  }

  async function boot() {
    console.log("Start IPFS node");
    const ipfs = await Ipfs.create();
    window.ipfs = ipfs;
    console.log("Start watching the DOM");
    watch(document, "img", loadUrl.bind(null, ipfs));
  }

  document.addEventListener("DOMContentLoaded", boot);

  /*
  const testHash = 'QmdnLDRvhNfyvJFbEsviBhbXjQ8EJK1JWrtggFZ8eYhaVG'
  const repoPath = 'ipfs-' + Math.random()
  const node = await Ipfs.create({ repo: repoPath })
  Hls.DefaultConfig.loader = HlsjsIpfsLoader
  Hls.DefaultConfig.debug = false
  if (Hls.isSupported()) {
    const video = document.getElementById('video')
    const hls = new Hls()
    hls.config.ipfs = node
    hls.config.ipfsHash = testHash
    hls.loadSource('master.m3u8')
    hls.attachMedia(video)
    hls.on(Hls.Events.MANIFEST_PARSED, () => video.play())
  }
  */
})();
