# URL Shortener

A public, anonymous service that exchanges a long URL for a short one, and redirects
visitors who follow it.

## Language

**Short Link**:
The record created when someone shortens a URL. Pairs a slug with a destination.
_Avoid_: link, entry, redirect, shortened URL

**Slug**:
The opaque identifier that appears in a short link's path and identifies exactly one
short link.
_Avoid_: code, hash, key, id, token, short code

**Destination**:
The URL a short link sends visitors to.
_Avoid_: target, long URL, original URL, source, href

**Resolve**:
Exchanging a slug for its destination. Only ever performed by the API.
_Avoid_: look up, expand, decode
