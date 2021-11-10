let $builtinmodule = function(name)
{
    let mod = {};
    // let myfact = function(n) {
    //     if(n < 1) {
    //         return 1;
    //     } else {
    //         return n * myfact(n-1);
    //     }
    // }
    // mod.fact = new Sk.builtin.func(function(a) {
    //     return myfact(a.v);  // extract the underlying JS value with .v
    // });
    //
    // mod.Stack = Sk.misceval.buildClass(mod, function($gbl, $loc) {
    //     $loc.__init__ = new Sk.builtin.func(function(self) {
    //         self.stack = [];
    //     });
    //     $loc.push = new Sk.builtin.func(function(self,x) {
    //         self.stack.push(x);
    //     });
    //     $loc.pop = new Sk.builtin.func(function(self) {
    //         return self.stack.pop();
    //     });
    // }, 'Stack', []);

    return mod;
}