import { proxy_tcp_over_websocket } from "./proxy_tcp_over_websocket.ts";
import { readBytesWithBYOBReader } from "./readBytesWithBYOBReader.ts";

/**
 * https://www.rfc-editor.org/rfc/rfc1928
 */
export async function socks5_server_second(conn: Deno.Conn) {
    const writer = conn.writable.getWriter();
    // +----+-----+-------+------+----------+----------+
    // |VER | CMD |  RSV  | ATYP | DST.ADDR | DST.PORT |
    // +----+-----+-------+------+----------+----------+
    // | 1  |  1  | X'00' |  1   | Variable |    2     |
    // +----+-----+-------+------+----------+----------+
    //Requests
    const [VER, CMD, RSV, ATYP] = await readBytesWithBYOBReader(
        conn.readable,
        4,
    );
    //   o  CMD
    //          o  CONNECT X'01'
    //          o  BIND X'02'
    //          o  UDP ASSOCIATE X'03'
    //    ATYP   address type of following address
    //          o  IP V4 address: X'01'
    //          o  DOMAINNAME: X'03'
    //          o  IP V6 address: X'04'
    // Addressing

    // In an address field (DST.ADDR, BND.ADDR), the ATYP field specifies
    // the type of address contained within the field:

    //        o  X'01'

    // the address is a version-4 IP address, with a length of 4 octets

    //        o  X'03'

    // the address field contains a fully-qualified domain name.  The first
    // octet of the address field contains the number of octets of name that
    // follow, there is no terminating NUL octet.

    //        o  X'04'

    // the address is a version-6 IP address, with a length of 16 octets.
    const address_length = ATYP === 1 ? 4 : ATYP === 4 ? 16 : 0;
    const address = address_length
        ? await readBytesWithBYOBReader(conn.readable, address_length)
        : await readBytesWithBYOBReader(
            conn.readable,
            (
                await readBytesWithBYOBReader(conn.readable, 1)
            )[0],
        );
    const raw_address = address_length ? address : [address.length, ...address];
    const port = await readBytesWithBYOBReader(conn.readable, 2);

    // +----+-----+-------+------+----------+----------+
    // |VER | REP |  RSV  | ATYP | BND.ADDR | BND.PORT |
    // +----+-----+-------+------+----------+----------+
    // | 1  |  1  | X'00' |  1   | Variable |    2     |
    // +----+-----+-------+------+----------+----------+
    //     o  VER    protocol version: X'05'
    //     o  REP    Reply field:
    //        o  X'00' succeeded
    //        o  X'01' general SOCKS server failure
    //        o  X'02' connection not allowed by ruleset
    //        o  X'03' Network unreachable
    //        o  X'04' Host unreachable
    //        o  X'05' Connection refused
    //        o  X'06' TTL expired
    //        o  X'07' Command not supported
    //        o  X'08' Address type not supported
    //        o  X'09' to X'FF' unassigned
    //     o  RSV    RESERVED
    //     o  ATYP   address type of following address

    //        o  IP V4 address: X'01'
    //        o  DOMAINNAME: X'03'
    //        o  IP V6 address: X'04'
    //     o  BND.ADDR       server bound address
    //     o  BND.PORT       server bound port in network octet order

    // Fields marked RESERVED (RSV) must be set to X'00'.

    // If the chosen method includes encapsulation for purposes of
    // authentication, integrity and/or confidentiality, the replies are
    // encapsulated in the method-dependent encapsulation.

    // CONNECT

    // In the reply to a CONNECT, BND.PORT contains the port number that the
    // server assigned to connect to the target host, while BND.ADDR
    // contains the associated IP address.  The supplied BND.ADDR is often
    // different from the IP address that the client uses to reach the SOCKS
    // server, since such servers are often multi-homed.  It is expected
    // that the SOCKS server will use DST.ADDR and DST.PORT, and the
    // client-side source address and port in evaluating the CONNECT
    // request.

    // BIND

    // The BIND request is used in protocols which require the client to
    // accept connections from the server.  FTP is a well-known example,
    // which uses the primary client-to-server connection for commands and
    // status reports, but may use a server-to-client connection for
    // transferring data on demand (e.g. LS, GET, PUT).

    // It is expected that the client side of an application protocol will
    // use the BIND request only to establish secondary connections after a
    // primary connection is established using CONNECT.  In is expected that
    // a SOCKS server will use DST.ADDR and DST.PORT in evaluating the BIND
    // request.

    // Two replies are sent from the SOCKS server to the client during a
    // BIND operation.  The first is sent after the server creates and binds
    // a new socket.  The BND.PORT field contains the port number that the
    // SOCKS server assigned to listen for an incoming connection.  The
    // BND.ADDR field contains the associated IP address.  The client will
    // typically use these pieces of information to notify (via the primary
    // or control connection) the application server of the rendezvous
    // address.  The second reply occurs only after the anticipated incoming
    // connection succeeds or fails.

    // In the second reply, the BND.PORT and BND.ADDR fields contain the
    // address and port number of the connecting host.

    // UDP ASSOCIATE

    // The UDP ASSOCIATE request is used to establish an association within
    // the UDP relay process to handle UDP datagrams.  The DST.ADDR and
    // DST.PORT fields contain the address and port that the client expects
    // to use to send UDP datagrams on for the association.  The server MAY
    // use this information to limit access to the association.  If the
    // client is not in possesion of the information at the time of the UDP
    // ASSOCIATE, the client MUST use a port number and address of all
    // zeros.

    // A UDP association terminates when the TCP connection that the UDP
    // ASSOCIATE request arrived on terminates.

    // In the reply to a UDP ASSOCIATE request, the BND.PORT and BND.ADDR
    // fields indicate the port number/address where the client MUST send
    // UDP request messages to be relayed.

    if (VER === 0x05 && CMD === 0x01 && RSV === 0x00) {
    } else {
        await writer.write(
            new Uint8Array([5, 7, 0, ATYP, ...raw_address, ...port]),
        );
        conn.close();
        return;
    }
    writer.releaseLock();
    await proxy_tcp_over_websocket(conn);
}
