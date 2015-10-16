<?php if(!class_exists('raintpl')){exit;}?><!DOCTYPE html>
<html lang="en">

<head>
    <title>ZeroPaste</title>
    <meta name="robots" content="noindex" />
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link type="text/css" rel="stylesheet" href="tpl/../css/bootstrap.min.css" />
    <link type="text/css" rel="stylesheet" href="tpl/../css/font-awesome.min.css" />
    <link type="text/css" rel="stylesheet" href="tpl/../css/style.css" />

    <script src="tpl/../js/jquery.js"></script>
    <script src="tpl/../js/bootstrap.min.js"></script>
    <script src="tpl/../js/sjcl.js"></script>
    <script src="tpl/../js/base64.js"></script>
    <script src="tpl/../js/rawdeflate.js"></script>
    <script src="tpl/../js/rawinflate.js"></script>
    <script src="tpl/../js/zeropaste.js"></script>

    <link type="text/css" rel="stylesheet" href="tpl/../js/highlight.styles/monokai.css">
    <script src="tpl/../js/highlight.pack.js"></script>

</head>

<body>

    <div class="first-row">
        <div class="container">
            <div class="row">

                <div class="col-xs-6">
                    <div class="brandbox">
                        <h1 title="ZeroPaste" onclick="window.location.href=scriptLocation();return false;">ZeroPaste</h1>
                        <h2>A zero-knowledge pastebin</h2>
                        <h3><?php echo $VERSION;?></h3>
                    </div>
                </div>

                <div class="col-xs-6">
                    <div class="aboutbox">
                        <p>ZeroPaste is a minimalist, opensource online pastebin where the server has zero knowledge of pasted data. The data is encrypted/decrypted <i>in the browser</i> using 256 bits AES. ZeroPaste is a forked project based on ZeroBin Alpha 0.19. More information about ZeroBin can be found at <a href="http://sebsauvage.net/wiki/doku.php?id=php:zerobin">its project page</a>.</p>
                    </div>
                </div>

            </div>
        </div>
    </div>
    <!-- /.first-row -->

    <div class="notification">
        <div class="container">
            <div class="row">
                <div class="col-xs-12">

                    <div id="status"><?php echo $STATUS;?></div>
                    <div id="errormessage" style="display:none"><?php echo htmlspecialchars( $ERRORMESSAGE );?></div>

                </div>
            </div>
        </div>
    </div>

    <div class="container">

        <div class="row">

            <div class="col-xs-8" id="leftcol">

                <div id="buttons">
                    <button type="button" class="btn btn-primary" id="newbutton" onclick="window.location.href=scriptLocation();return false;" style="display:none;"><i class="fa fa-pencil"></i> Create New Paste</button>
                    <button type="button" class="btn btn-success" id="sendbutton" onclick="send_data();return false;" style="display:none;"><i class="fa fa-plus"></i> Submit Paste</button>
                    <button type="button" class="btn btn-default" id="clonebutton" onclick="clonePaste();return false;" style="display:none;"><i class="fa fa-files-o"></i> Clone this Paste</button>
                    <button type="button" class="btn btn-default" id="rawtextbutton" onclick="rawText();return false;" style="display:none;"><i class="fa fa-file-text-o"></i> Raw Text</button>
                </div>

                <div id="remainingtime" style="display:none;" class="alert alert-warning remainingtime" role="alert"></div>

                <div class="panel panel-warning" id="pastecontent">
                    <div class="panel-heading" id="pasteresult" style="display:none;">
                        <div id="pastelink"></div>
                        <div id="linkbutton"></div>
                    </div>
                    <div class="panel-body" id="pasteinput">
                        <div id="cleartext" style="display:none;"></div>
                        <textarea id="message" class="form-control" name="message" rows="25" style="display:none;" placeholder="Insert or write your paste here.."></textarea>
                    </div>
                </div>

            </div>
            <!-- /.col-xs-8 -->

            <div class="col-xs-4" id="rightcol">

                <div class="panel panel-default" id="pasteoptions" style="display:none;">
                    <div class="panel-heading">
                        <h3 class="panel-title"><i class="fa fa-cogs"></i> Paste Options</h3>
                    </div>
                    <div class="panel-body">
                        <form class="form-horizontal">

                            <div class="form-group" id="expiration" style="display:none;">
                                <label for="pasteExpiration" class="col-sm-3 control-label">Expires:</label>
                                <div class="col-sm-9">
                                    <select class="form-control" id="pasteExpiration" name="pasteExpiration">
                                        <option value="5min">5 minutes</option>
                                        <option value="10min">10 minutes</option>
                                        <option value="1hour">1 hour</option>
                                        <option value="1day">1 day</option>
                                        <option value="1week">1 week</option>
                                        <option value="1month" selected="selected">1 month</option>
                                        <option value="1year">1 year</option>
                                        <option value="never">Never</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <div class="col-sm-offset-3 col-sm-9">
                                    <label class="checkbox-inline " id="burnafterreadingoption" style="display:none;">
                                        <input type="checkbox" id="burnafterreading" name="burnafterreading"> Destroy after reading
                                    </label>
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="col-sm-offset-3 col-sm-9">
                                    <label class="checkbox-inline" id="opendisc" style="display:none;">
                                        <input type="checkbox" id="opendiscussion" name="opendiscussion"> Enable discussion
                                    </label>
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="col-sm-offset-3 col-sm-9">
                                    <label class="checkbox-inline" id="syntaxcoloringoption" style="display:none;">
                                        <input type="checkbox" id="syntaxcoloring" name="syntaxcoloring"> Syntax coloring
                                    </label>
                                </div>
                            </div>

                        </form>
                    </div>
                </div>

            </div>
            <!-- /.col-xs-4 -->

        </div>
        <!-- /.row -->

        <div id="discussion" style="display:none;">
            <h4><i class="fa fa-comments"></i> Discussion</h4>
            <div id="comments"></div>
        </div>
        <div id="cipherdata" style="display:none;"><?php echo $CIPHERDATA;?></div>

    </div>
    <!-- /.container -->
</body>

</html>