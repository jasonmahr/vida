//
//  ViewController.swift
//  Vida
//
//  Created by Ryoya Ogishima on 11/12/16.
//  Copyright © 2016 YHack16. All rights reserved.
//

import UIKit

class ViewController: UIViewController {
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
    }
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    @IBAction func Male(_ sender: Any) {
        self.view.backgroundColor = UIColor.blue
    }

    @IBAction func Female(_ sender: Any) {
        self.view.backgroundColor = UIColor.magenta
    }
    
    @IBAction func in20(_ sender: Any) {
    }
    @IBAction func in30(_ sender: Any) {
    }
    @IBAction func in40(_ sender: Any) {
    }
    @IBAction func in50(_ sender: Any) {
    }
    @IBAction func out20(_ sender: Any) {
    }
    @IBAction func out30(_ sender: Any) {
    }
    @IBAction func out40(_ sender: Any) {
    }
    @IBAction func out50(_ sender: Any) {
    }
}
