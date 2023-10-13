#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""Common functions to serve other packages.

This module includes common functions such as:

    * configuration
    * date arithmetic
    * generic repository access

"""

import configparser
import sys

def eprint(*args, **kwargs):
    """Print to stderr."""
    print(*args, file=sys.stderr, **kwargs)


def load_access_token(section, key):
    """Load the github API access token from config file.

    Parameters
    ----------
    None

    Returns
    -------
    str
        the github access token
    """
    parser = configparser.ConfigParser()
    parser.read('credential.ini')
    section = parser[section]
    return section[key]
