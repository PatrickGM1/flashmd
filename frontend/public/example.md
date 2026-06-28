# Computer Networks Basics

## What is a protocol?
A set of rules governing how data is transmitted between devices.
Examples: HTTP, TCP, UDP, IP.

## What are the layers of the OSI model?
7 layers (top to bottom):
1. Application
2. Presentation
3. Session
4. Transport
5. Network
6. Data Link
7. Physical

## What is the difference between TCP and UDP?
TCP: connection-oriented, reliable, ordered delivery, slower.
UDP: connectionless, unreliable, no ordering, faster.
Use TCP for HTTP/file transfer; UDP for video/gaming/DNS.

## What is a MAC address?
48-bit hardware identifier burned into a NIC.
Used at the Data Link layer (Layer 2) for local delivery.
Format: `AA:BB:CC:DD:EE:FF`

# Data Encoding

## What is Manchester encoding?
Each bit represented by a voltage transition mid-period.
0 → high-to-low, 1 → low-to-high (IEEE 802.3).
Self-clocking: receiver syncs from transitions.

## What is 4B/5B encoding?
Maps every 4-bit nibble to a 5-bit code.
Guarantees no more than 3 consecutive zeros.
Used in 100BASE-TX with NRZI to ensure clock sync.

## What is QAM?
Quadrature Amplitude Modulation.
Encodes data by varying both amplitude and phase of a carrier.
QAM-16 = 4 bits/symbol, QAM-64 = 6 bits/symbol.

# Wireless Networks

## What is the difference between SSID, BSSID, and ESSID?
SSID: human-readable network name.
BSSID: MAC address of an individual access point.
ESSID: extended SSID shared across multiple APs (same logical network).

## What is multipath fading?
Signal arrives at receiver via multiple reflected paths.
Copies interfere constructively or destructively.
Mitigated with OFDM, MIMO, or antenna diversity.
