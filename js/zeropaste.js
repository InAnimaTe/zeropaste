/*
ZeroPaste is a zero-knowledge paste bin forked based on ZeroBin Alpha 0.19.
The details about ZeroBin can be found at http://sebsauvage.net/wiki/doku.php?id=php:zerobin

@version ZeroPaste v1.0
@author Heiswayi Nrird
@website https://wayi.me
*/
// Immediately start random number generator collector.
sjcl.random.startCollectors();

/**
 *  Converts a duration (in seconds) into human readable format.
 *
 *  @param int seconds
 *  @return string
 */
function secondsToHuman(seconds) {
    if (seconds < 60) {
        var v = Math.floor(seconds);
        return v + ' second' + ((v > 1) ? 's' : '');
    }
    if (seconds < 60 * 60) {
        var v = Math.floor(seconds / 60);
        return v + ' minute' + ((v > 1) ? 's' : '');
    }
    if (seconds < 60 * 60 * 24) {
        var v = Math.floor(seconds / (60 * 60));
        return v + ' hour' + ((v > 1) ? 's' : '');
    }
    // If less than 2 months, display in days:
    if (seconds < 60 * 60 * 24 * 60) {
        var v = Math.floor(seconds / (60 * 60 * 24));
        return v + ' day' + ((v > 1) ? 's' : '');
    }
    var v = Math.floor(seconds / (60 * 60 * 24 * 30));
    return v + ' month' + ((v > 1) ? 's' : '');
}

/**
 * Converts an associative array to an encoded string
 * for appending to the anchor.
 *
 * @param object associative_array Object to be serialized
 * @return string
 */
function hashToParameterString(associativeArray) {
    var parameterString = ""
    for (key in associativeArray) {
        if (parameterString === "") {
            parameterString = encodeURIComponent(key);
            parameterString += "=" + encodeURIComponent(associativeArray[key]);
        } else {
            parameterString += "&" + encodeURIComponent(key);
            parameterString += "=" + encodeURIComponent(associativeArray[key]);
        }
    }
    //padding for URL shorteners
    parameterString += "&p=p";

    return parameterString;
}

/**
 * Converts a string to an associative array.
 *
 * @param string parameter_string String containing parameters
 * @return object
 */
function parameterStringToHash(parameterString) {
    var parameterHash = {};
    var parameterArray = parameterString.split("&");
    for (var i = 0; i < parameterArray.length; i++) {
        //var currentParamterString = decodeURIComponent(parameterArray[i]);
        var pair = parameterArray[i].split("=");
        var key = decodeURIComponent(pair[0]);
        var value = decodeURIComponent(pair[1]);
        parameterHash[key] = value;
    }

    return parameterHash;
}

/**
 * Get an associative array of the parameters found in the anchor
 *
 * @return object
 **/
function getParameterHash() {
    var hashIndex = window.location.href.indexOf("#");
    if (hashIndex >= 0) {
        return parameterStringToHash(window.location.href.substring(hashIndex + 1));
    } else {
        return {};
    }
}

/**
 * Compress a message (deflate compression). Returns base64 encoded data.
 *
 * @param string message
 * @return base64 string data
 */
function compress(message) {
    return Base64.toBase64(RawDeflate.deflate(Base64.utob(message)));
}

/**
 * Decompress a message compressed with compress().
 */
function decompress(data) {
    return Base64.btou(RawDeflate.inflate(Base64.fromBase64(data)));
}

/**
 * Compress, then encrypt message with key.
 *
 * @param string key
 * @param string message
 * @return encrypted string data
 */
function zeroCipher(key, message) {
        return sjcl.encrypt(key, compress(message));
    }
    /**
     *  Decrypt message with key, then decompress.
     *
     *  @param key
     *  @param encrypted string data
     *  @return string readable message
     */
function zeroDecipher(key, data) {
    return decompress(sjcl.decrypt(key, data));
}

/**
 * @return the current script location (without search or hash part of the URL).
 *   eg. http://server.com/zero/?aaaa#bbbb --> http://server.com/zero/
 */
function scriptLocation() {
    var scriptLocation = window.location.href.substring(0, window.location.href.length - window.location.search.length - window.location.hash.length);
    var hashIndex = scriptLocation.indexOf("#");
    if (hashIndex !== -1) {
        scriptLocation = scriptLocation.substring(0, hashIndex)
    }
    return scriptLocation
}

/**
 * @return the paste unique identifier from the URL
 *   eg. 'c05354954c49a487'
 */
function pasteID() {
    return window.location.search.substring(1);
}

function htmlEntities(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    /**
     * Set text of a DOM element (required for IE)
     * This is equivalent to element.text(text)
     * @param object element : a DOM element.
     * @param string text : the text to enter.
     */
function setElementText(element, text) {
    var html = htmlEntities(text);
    element.html('<pre class="precontent" id="xcontent">' + html + '</pre>');
}

function setElementText2(element, text) {
    var html = htmlEntities(text);
    element.html(html);
}

/** Apply syntax coloring to clear text area.
 */
function applySyntaxColoring(language) {
    if ($('#cleartext').html().substring(0, 11) != '<pre><code>') {
        // highlight.js expects code to be surrounded by <pre><code>
        $('#cleartext').html('<pre><code>' + $('#xcontent').html() + '</code></pre>');
    }
    hljs.configure({languages: [language]})
    hljs.highlightBlock(document.getElementById('cleartext'));
    $('#cleartext').css('padding', '0'); // Remove white padding around code box.
}


/**
 * Show decrypted text in the display area, including discussion (if open)
 *
 * @param string key : decryption key
 * @param array comments : Array of messages to display (items = array with keys ('data','meta')
 */
function displayMessages(key, comments) {
    try { // Try to decrypt the paste.
        var cleartext = zeroDecipher(key, comments[0].data);
    } catch (err) {
        $('#pasteresult').hide();
        $('#cleartext').html('&gt;_ERROR.. ~!@#$%^&*()').show();
        $('#sendbutton').hide();
        $('#clonebutton').hide();
        $('#rawtextbutton').hide();
        showError('Could not decrypt data (Wrong key ?)');
        return;
    }
    setElementText($('#cleartext'), cleartext);
    urls2links($('#cleartext')); // Convert URLs to clickable links.

    // comments[0] is the paste itself.

    if (comments[0].meta.syntaxcoloring) {
        applySyntaxColoring(comments[0].meta.language);
    }

        

    // Display paste expiration.
    if (comments[0].meta.expire_date) $('#remainingtime').removeClass('foryoureyesonly').html('This document will expire in <strong>' + secondsToHuman(comments[0].meta.remaining_time) + '</strong>.').show();
    if (comments[0].meta.burnafterreading) {
        $('#remainingtime').addClass('foryoureyesonly').html('<strong>FOR YOUR EYES ONLY.</strong>  Do not close this window, or this message cannot be displayed again (destroyed automatically).').show();
        $('#clonebutton').hide(); // Discourage cloning (as it can't really be prevented).
    }

    // If the discussion is opened on this paste, display it.
    if (comments[0].meta.opendiscussion) {
        $('div#comments').html('');
        // For each comment.
        for (var i = 1; i < comments.length; i++) {
            var comment = comments[i];
            var cleartext = "[Could not decrypt comment ; Wrong key ?]";
            try {
                cleartext = zeroDecipher(key, comment.data);
            } catch (err) {}
            var place = $('div#comments');
            // If parent comment exists, display below (CSS will automatically shift it right.)
            var cname = 'div#comment_' + comment.meta.parentid

            // If the element exists in page
            if ($(cname).length) {
                place = $(cname);
            }
            var divComment = $('<div class="scomment" id="comment_' + comment.meta.commentid + '">' + '<div class="commentmeta"><span class="nickname"></span><span class="commentdate"></span></div><div class="commentdata"></div>' + '<hr class="cline"><button onclick="open_reply($(this),\'' + comment.meta.commentid + '\');return false;" class="btn btn-default btn-sm"><i class="mdi mdi-reply"></i> Reply</button>' + '</div>');
            setElementText2(divComment.find('div.commentdata'), cleartext);
            // Convert URLs to clickable links in comment.
            urls2links(divComment.find('div.commentdata'));
            divComment.find('span.nickname').html('<i>(Anonymous)</i>');

            // Try to get optional nickname:
            try {
                divComment.find('span.nickname').text(zeroDecipher(key, comment.meta.nickname));
            } catch (err) {}
            divComment.find('span.commentdate').text('  (' + (new Date(comment.meta.postdate * 1000).toString()) + ')').attr('title', 'CommentID: ' + comment.meta.commentid);

            // If an avatar is available, display it.
            if (comment.meta.vizhash) {
                divComment.find('span.nickname').before('<img src="' + comment.meta.vizhash + '" class="vizhash" title="Anonymous Avatar (Vizhash of the IP address)" />');
            }

            place.append(divComment);
        }
        $('div#comments').append('<div class="scomment cadd"><button onclick="open_reply($(this),\'' + pasteID() + '\');return false;" class="btn btn-primary cadd-btn"><i class="mdi mdi-pencil"></i> Add Comment</button></div>');
        $('div#discussion').show();
    }
}

/**
 * Open the comment entry when clicking the "Reply" button of a comment.
 * @param object source : element which emitted the event.
 * @param string commentid = identifier of the comment we want to reply to.
 */
function open_reply(source, commentid) {
    $('div.reply').remove(); // Remove any other reply area.
    var content="";
    content+='<div class="reply">';
    content+='<div class="row">';
    content+='<div class="col s12 m12 l12">';
    content+='<div class="input-field col s12"><input id="nickname" type="text" class="cinput-nickname"><label for="nickname">Nickname (Optional)</label></div>';
    content+=' <div class="input-field col s12"><textarea id="replymessage" class="materialize-textarea replymessage cinput-comment"></textarea><label for="replymessage">Write your comment here..</label></div>';
    content+='<button id="replybutton" onclick="send_comment(\'' + commentid + '\');return false;" class="btn btn-success btn-sm">Post Comment</button>';
    content+='<div id="replystatus">&nbsp;</div>'
    content+='</div>';
    content+='</div>';
    content+='</div>';

    source.after(content);
    $('input#nickname').focus(function() {
        $(this).css('color', '#000');
        if ($(this).val() == $(this).attr('title')) {
            $(this).val('');
        }
    });
    $('textarea#replymessage').focus();
}

/**
 * Send a reply in a discussion.
 * @param string parentid : the comment identifier we want to send a reply to.
 */
function send_comment(parentid) {
    // Do not send if no data.
    if ($('textarea#replymessage').val().length == 0) {
        return;
    }

    showStatus('Sending comment...', spin = true);
    var cipherdata = zeroCipher(pageKey(), $('textarea#replymessage').val());
    var ciphernickname = '';
    var nick = $('input#nickname').val();
    if (nick != '' && nick != 'Nickname (Optional)') {
        ciphernickname = zeroCipher(pageKey(), nick);
    }
    var data_to_send = {
        data: cipherdata,
        parentid: parentid,
        pasteid: pasteID(),
        nickname: ciphernickname
    };

    $.post(scriptLocation(), data_to_send, 'json')
        .error(function() {
            showError('Comment could not be sent (serveur error or not responding).');
        })
        .success(function(data) {
            if (data.status == 0) {
                showStatus('Comment posted.');
                location.reload();
            } else if (data.status == 1) {
                showError('Could not post comment: ' + data.message);
            } else {
                showError('Could not post comment.');
            }
        });
}


/**
 *  Send a new paste to server
 */
function send_data() {
    // Do not send if no data.
    if ($('textarea#message').val().length == 0) {
        return;
    }

    // If sjcl has not collected enough entropy yet, display a message.
    if (!sjcl.random.isReady()) {
        showStatus('Sending paste (Please move your mouse for more entropy)...', spin = true);
        sjcl.random.addEventListener('seeded', function() {
            send_data();
        });
        return;
    }

    showStatus('Sending paste...', spin = true);

    var randomkey = sjcl.codec.base64.fromBits(sjcl.random.randomWords(8, 0), 0);
    var cipherdata = zeroCipher(randomkey, $('textarea#message').val());
    var data_to_send = {
        data: cipherdata,
        expire: $('select#pasteExpiration').val(),
        burnafterreading: $('input#burnafterreading').is(':checked') ? 1 : 0,
        opendiscussion: $('input#opendiscussion').is(':checked') ? 1 : 0,
        syntaxcoloring: $('input#syntaxcoloring').is(':checked') ? 1 : 0,
        language: $('select#language').val(),
    };
    $.post(scriptLocation(), data_to_send, 'json')
        .error(function() {
            showError('Data could not be sent (server error or not responding).');
        })
        .success(function(data) {
            if (data.status == 0) {
                stateExistingPaste();
                var url = scriptLocation() + "?" + data.id + '#' + randomkey;
                var deleteUrl = scriptLocation() + "?pasteid=" + data.id + '&deletetoken=' + data.deletetoken;
                showStatus('');

                $('div#pastelink').html('<div class="input-group"><span class="input-group-addon">Your Paste URL:</span><input type="text" class="form-control" id="pasteurl" aria-label="Paste URL" value="' + url + '" onclick="this.setSelectionRange(0, this.value.length)"><span class="input-group-addon">Hit <kbd>ctrl</kbd>+<kbd>c</kbd> to Copy</span></div>');
                $('div#linkbutton').html('<div class="btn-group btn-group-justified" role="group"><a href="' + url + '" target="_blank" class="btn btn-info btn-icon"><i class="mdi mdi-open-in-new"></i></a><a href="' + deleteUrl + '" class="btn btn-danger btn-icon"><i class="mdi mdi-delete"></i></a></div>');
                $('div#pasteresult').show();
                $('#pasteurl').select();
                $('#pasteurl').focus();

                setElementText($('div#cleartext'), $('textarea#message').val());
                urls2links($('div#cleartext'));

                // FIXME: Add option to remove syntax highlighting ?
                if ($('input#syntaxcoloring').is(':checked')) applySyntaxColoring(data_to_send.language);

                showStatus('');
            } else if (data.status == 1) {
                showError('Could not create paste: ' + data.message);
            } else {
                showError('Could not create paste.');
            }
        });
}


/** Text range selection.
 *  From: http://stackoverflow.com/questions/985272/jquery-selecting-text-in-an-element-akin-to-highlighting-with-your-mouse
 *  @param string element : Indentifier of the element to select (id="").
 */
function selectText(element) {
        var doc = document,
            text = doc.getElementById(element),
            range, selection;
        if (doc.body.createTextRange) { //ms
            range = doc.body.createTextRange();
            range.moveToElementText(text);
            range.select();
        } else if (window.getSelection) { //all others
            selection = window.getSelection();
            range = doc.createRange();
            range.selectNodeContents(text);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
    /**
     * Put the screen in "New paste" mode.
     */
function stateNewPaste() {
    $('button#sendbutton').show();
    $('button#clonebutton').hide();
    $('button#rawtextbutton').hide();
    $('div#expiration').show();
    $('div#remainingtime').hide();
    $('label#burnafterreadingoption').show();
    $('label#opendisc').show();
    $('label#syntaxcoloringoption').show();
    $('button#newbutton').show();
    $('div#pasteresult').hide();
    $('textarea#message').text('');
    $('textarea#message').show();
    $('textarea#message').next().show();
    $('div#cleartext').hide();
    $('div#message').focus();
    $('div#discussion').hide();
    $('div#pasteoptions').show();
    $('#rightcol').removeClass('hide');
}

/**
 * Put the screen in "Existing paste" mode.
 */
function stateExistingPaste() {
    $('button#sendbutton').hide();

    // No "clone" for IE<10.
    if ($('div#oldienotice').is(":visible")) {
        $('button#clonebutton').hide();
    } else {
        $('button#clonebutton').show();
    }
    $('button#rawtextbutton').show();

    $('div#expiration').hide();
    $('label#burnafterreadingoption').hide();
    $('label#opendisc').hide();
    $('label#syntaxcoloringoption').hide();
    $('button#newbutton').show();
    $('div#pasteresult').hide();
    $('textarea#message').hide();
    $('textarea#message').next().hide();
    $('div#cleartext').show();
    $('div#pasteoptions').hide();
    $('#rightcol').addClass('hide');
}

/** Return raw text
 */
function rawText() {
    var paste = $('div#cleartext').html();
    var newDoc = document.open('text/html', 'replace');
    newDoc.write('<pre>' + paste + '</pre>');
    newDoc.close();
}

/**
 * Clone the current paste.
 */
function clonePaste() {
    stateNewPaste();

    //Erase the id and the key in url
    history.replaceState(document.title, document.title, scriptLocation());

    showStatus('');
    $('textarea#message').text($('div#cleartext').text());
}

/**
 * Create a new paste.
 */
function newPaste() {
    stateNewPaste();
    showStatus('');
    $('textarea#message').text('');
}

/**
 * Display an error message
 * (We use the same function for paste and reply to comments)
 */
function showError(message) {
    $('#status').addClass('errorMessage').text(message);
    $('#replystatus').addClass('errorMessage').text(message);
}

/**
 * Display status
 * (We use the same function for paste and reply to comments)
 *
 * @param string message : text to display
 * @param boolean spin (optional) : tell if the "spinning" animation should be displayed.
 */
function showStatus(message, spin) {
    $('div#replystatus').removeClass('errorMessage');
    $('div#replystatus').text(message);
    if (!message) {
        $('#status').html('&nbsp;');
        return;
    }
    if (message == '') {
        $('#status').html('&nbsp;');
        return;
    }
    $('#status').removeClass('errorMessage');
    $('#status').text(message);
    if (spin) {
        var img = '<img src="img/busy.gif" style="width:16px;height:9px;margin:0px 4px 0px 0px;" />';
        $('#status').prepend(img);
        $('div#replystatus').prepend(img);
    }
}

/**
 * Convert URLs to clickable links.
 * URLs to handle:
 * <code>
 *     magnet:?xt.1=urn:sha1:YNCKHTQCWBTRNJIV4WNAE52SJUQCZO5C&xt.2=urn:sha1:TXGCZQTH26NL6OUQAJJPFALHG2LTGBC7
 *     http://localhost:8800/zero/?6f09182b8ea51997#WtLEUO5Epj9UHAV9JFs+6pUQZp13TuspAUjnF+iM+dM=
 *     http://user:password@localhost:8800/zero/?6f09182b8ea51997#WtLEUO5Epj9UHAV9JFs+6pUQZp13TuspAUjnF+iM+dM=
 * </code>
 *
 * @param object element : a jQuery DOM element.
 * @FIXME: add ppa & apt links.
 */
function urls2links(element) {
    var re = /((http|https|ftp):\/\/[\w?=&.\/-;#@~%+-]+(?![\w\s?&.\/;#~%"=-]*>))/ig;
    element.html(element.html().replace(re, '<a href="$1" rel="nofollow">$1</a>'));
    var re = /((magnet):[\w?=&.\/-;#@~%+-]+)/ig;
    element.html(element.html().replace(re, '<a href="$1">$1</a>'));
}

/**
 * Return the deciphering key stored in anchor part of the URL
 */
function pageKey() {
    var key = window.location.hash.substring(1); // Get key

    // Some stupid web 2.0 services and redirectors add data AFTER the anchor
    // (such as &utm_source=...).
    // We will strip any additional data.

    // First, strip everything after the equal sign (=) which signals end of base64 string.
    i = key.indexOf('=');
    if (i > -1) {
        key = key.substring(0, i + 1);
    }

    // If the equal sign was not present, some parameters may remain:
    i = key.indexOf('&');
    if (i > -1) {
        key = key.substring(0, i);
    }

    // Then add trailing equal sign if it's missing
    if (key.charAt(key.length - 1) !== '=') key += '=';

    return key;
}

$(function() {

    // If "burn after reading" is checked, disable discussion.
    $('input#burnafterreading').change(function() {
        if ($(this).is(':checked')) {
            $('div#opendisc').addClass('buttondisabled');
            $('input#opendiscussion').attr({
                checked: false
            });
            $('input#opendiscussion').attr('disabled', true);
        } else {
            $('div#opendisc').removeClass('buttondisabled');
            $('input#opendiscussion').removeAttr('disabled');
        }
    });

    $('select#language').attr('disabled',true);
    $('input#syntaxcoloring').change(function() {
        if ($(this).is(':checked')) {
            $('select#language').attr('disabled',false);
            $('select').material_select();
        } else {
            $('select#language').attr('disabled',true);
            $('select').material_select();
        }
    });

    // Display status returned by php code if any (eg. Paste was properly deleted.)
    if ($('div#status').text().length > 0) {
        $('#pastecontent').hide();
        $("#pasteoptions").hide();
        $('#newbutton').addClass("col s12 m12 l12");
        $('#newbutton').show();
        showStatus($('div#status').text(), false);
        return;
    }

    $('div#status').html('&nbsp;'); // Keep line height even if content empty.

    // Display an existing paste
    if ($('div#cipherdata').text().length > 1) {
        // Missing decryption key in URL ?
        if (window.location.hash.length == 0) {
            showError('Cannot decrypt paste: Decryption key missing in URL (Did you use a redirector or an URL shortener which strips part of the URL ?)');
            return;
        }

        // List of messages to display
        var messages = jQuery.parseJSON($('div#cipherdata').text());

        // Show proper elements on screen.
        stateExistingPaste();

        displayMessages(pageKey(), messages);
    }
    // Display error message from php code.
    else if ($('div#errormessage').text().length > 1) {
        showError($('div#errormessage').text());
        $('#pastecontent').hide();
        $("#pasteoptions").hide();
        $('#newbutton').addClass("col s12 m12 l12");
        $('#newbutton').show();
    }
    // Create a new paste.
    else {
        newPaste();
    }
});