*State of this project: proof of concept*

# ipfs-cdn

[Demo][demo]

Say **YES** to self-hosting, say **NO** to surveillance capitalism.

What if you could use IPFS for your website today, without asking your visitors to use a specific browser or install an extension? Offload heavy assets like images, video, pdfs, to a peer to peer network! Stop relying on proprietary platforms built for surveillance capitalism today!

`ipfs-cdn` makes IPFS your Content Distribution Network for your static website assets\*.

`ipfs-cdn` is a CLI tool that will:
- Add your static assets to an IPFS node.
- Manipulate HTML tags to point to the CID of the static asset.
- Add `ipfs-shim.js` and other libraries to the `<head>` if your HTML.

`ipfs-shim.js` instantiates an IPFS node in the visitor's browser and replaces the CIDs in the HTML code with their actual content, downloaded from IPFS. (The heavy lifting is done by [js-ipfs][js-ipfs].)

\*: right now it supports only images and videos.

## How to use it

### Publish

You have a static website generator. Let's say the generated output is in the directory `public`, then you can run:

```
ipfs-cdn build public -i
```

The command searches for all `html` files in `public`, extract and adds all static assets to IPFS, and updates the DOM with the URL of the newly created CID. Changes are done in place, so it will modify the original files. If you don't want this, drop the `-i` option.

Now your website is ready to be published!

### Help with content distribution

If you are working on the same website or you want to help with content distribution, first build your webiste, then run:

```
ipfs-cdn pin public
```

## Why

You host your static website in your server. While HTML is pretty cheap to serve, other assets like images, videos, archives, or PDF documents can be quite expensive in terms of bandwitdh. Moreover, video is a PITA to distribute properly, since it requires adaptive bitrate streaming. Hosting large files is often delegated to third party services, for example a video is usually uploaded to YouTube of Vimeo, and then a player is embedded in the website. Other platforms are Scribd and SlideShare.

This has many downsides:

- Your visitors' data is donated to big companies.
- Your content is now under the publisher's terms of service.
- The publisher can decide to charge you, or decide that they don't like you anymore.

## Content availability

`ipfs-cdn` relies on the IPFS infrastructure. Other nodes that duplicate your content can cache it for a limited amount of time, and then delete it, so you cannot rely on them.

Content availability works better when you have a small organization behind your website, so multiple developers can run their own IPFS node and pin exactly the same assets. For example in [Social Dist0rtion Protocol][sdp:github] we have around five people that can run IPFS in their laptops and home computers to serve assets for our [website][sdp:website]. In order to be all on the same page, each of us has to checkout the website [respository][sdp:website:github] and run `ipfs-cdn pin`

[demo]: ./demo
[js-ipfs]: https://github.com/ipfs/js-ipfs/
[sdp:github]: https://github.com/social-dist0rtion-protocol
[sdp:website]: https://www.dist0rtion.com/
[sdp:website:github]: https://github.com/social-dist0rtion-protocol/www-data
