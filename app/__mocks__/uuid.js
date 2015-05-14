var uuid_v4_value = 'mocked_v4_uuid';

exports.__set_uuid_v4__ = function(uuid) {
    uuid_v4_value = uuid;
};

exports.v4 = function() {
    return uuid_v4_value;
};
